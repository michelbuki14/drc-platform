"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/fraud
 *   Returns fraud analysis report: flagged transactions from last N hours.
 *
 * POST /api/fraud/flag
 *   Manually flags a transaction for review.
 */

export async function GET(req: NextRequest) {
  const sinceHours = Number(req.nextUrl.searchParams.get("sinceHours") ?? "168");
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

  const txs = await prisma.transaction.findMany({
    where: { status: "succeeded", createdAt: { gte: since } },
    include: { user: { select: { email: true, walletBalanceUsd: true } } },
    orderBy: { createdAt: "desc" },
  });

  const flags = [];

  // Rapid succession detection
  for (let i = 0; i < txs.length; i++) {
    const a = txs[i];
    for (let k = i + 1; k < txs.length; k++) {
      const b = txs[k];
      if (a.userId === b.userId) {
        const diffMs = Math.abs(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        if (diffMs < 5 * 60 * 1000) {
          flags.push({
            txRef: a.reference,
            userEmail: a.user.email,
            amountUsd: a.amountUsd,
            reason: `Rapid succession: ${Math.round(diffMs / 1000)}s after another charge`,
            severity: "high",
          });
          break;
        }
      }
    }
  }

  // High CDF mobile money
  const highCdf = txs.filter(
    t => ["mpesa", "airtel_money", "orange_money"].includes(t.method)
      && t.amountLocal != null && t.amountLocal > 5000 * 2850
  );
  for (const t of highCdf) {
    flags.push({
      txRef: t.reference,
      userEmail: t.user.email,
      amountUsd: t.amountUsd,
      reason: `High CDF mobile money charge: $${t.amountUsd.toFixed(2)} USD (${t.amountLocal} CDF)`,
      severity: "medium",
    });
  }

  // Sandbox test pattern (.99)
  const sandboxTest = txs.filter(t => Math.round(t.amountUsd * 100) % 100 === 99);
  for (const t of sandboxTest) {
    flags.push({
      txRef: t.reference,
      userEmail: t.user.email,
      amountUsd: t.amountUsd,
      reason: "Sandbox test pattern: amount ends in .99",
      severity: "low",
    });
  }

  return NextResponse.json({
    data: {
      period: `${sinceHours}h`,
      analysed: txs.length,
      flags,
      summary: {
        high: flags.filter(f => f.severity === "high").length,
        medium: flags.filter(f => f.severity === "medium").length,
        low: flags.filter(f => f.severity === "low").length,
      },
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.txRef) {
    return NextResponse.json({ error: "txRef required" }, { status: 400 });
  }
  const existing = await prisma.fraudAttempt.findUnique({ where: { txRef: body.txRef } });
  if (existing) {
    return NextResponse.json({ error: "Already flagged", data: existing }, { status: 409 });
  }
  const flag = await prisma.fraudAttempt.create({
    data: {
      txRef: body.txRef,
      userId: body.userId ?? "system",
      paymentMethod: body.method ?? "unknown",
      amountUsd: body.amountUsd ?? 0,
      riskScore: body.riskScore ?? 0.5,
      status: "flagged",
      analystNotes: body.notes ?? null,
    },
  });
  return NextResponse.json({ data: flag }, { status: 201 });
}
