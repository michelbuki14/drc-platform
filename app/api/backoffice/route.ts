import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

/**
 * Backoffice console API — platform-wide control.
 * GET  ?view=overview|transactions|partners
 * POST actions: approve_partner | suspend_partner | refund | payout
 */
export async function GET(req: NextRequest) {
  const s = requireRole(req, ["admin", "backoffice"]);
  if (s instanceof NextResponse) return s;
  const view = req.nextUrl.searchParams.get("view") ?? "overview";

  if (view === "transactions") {
    const txs = await prisma.transaction.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ count: txs.length, data: txs });
  }

  if (view === "partners") {
    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: "desc" },
    });
    // Count partnerSales per partner
    const partnerIds = partners.map(p => p.id);
    const salesCounts = await prisma.partnerSale.groupBy({
      by: ["partnerId"],
      _count: { partnerId: true },
      where: { partnerId: { in: partnerIds } },
    });
    const countMap = new Map(salesCounts.map(sc => [sc.partnerId, sc._count.partnerId]));
    const partnersWithCount = partners.map(p => ({
      ...p,
      salesCount: countMap.get(p.id) || 0,
    }));
    return NextResponse.json({ count: partnersWithCount.length, data: partnersWithCount });
  }

  // Overview KPIs
  const [txAgg, users, partnersPending, flightsToday, paxToday, revenue] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: "succeeded" },
      _sum: { amountUsd: true },
      _count: true,
    }),
    prisma.user.count(),
    prisma.partner.count({ where: { status: "pending" } }),
    prisma.flightInstance.count({ where: { schedDepart: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(new Date().setHours(24, 0, 0, 0)) } } }),
    prisma.passenger.count(),
    prisma.booking.aggregate({ _sum: { totalUsd: true }, _count: true }),
  ]);

  const byMethod = await prisma.transaction.groupBy({
    by: ["method"],
    where: { status: "succeeded" },
    _sum: { amountUsd: true },
    _count: true,
  });

  return NextResponse.json({
    data: {
      payments: {
        succeededTotalUsd: Math.round((txAgg._sum.amountUsd ?? 0) * 100) / 100,
        succeededCount: txAgg._count,
        byMethod: byMethod.map((m: any) => ({ method: m.method, totalUsd: m._sum.amountUsd ?? 0, count: m._count })),
      },
      commerce: {
        bookingsCount: revenue._count,
        bookingsTotalUsd: Math.round((revenue._sum.totalUsd ?? 0) * 100) / 100,
      },
      users,
      partnersPendingApproval: partnersPending,
      flightsToday,
      passengersOnboard: paxToday,
    },
  });
}

export async function POST(req: NextRequest) {
  const s = requireRole(req, ["admin", "backoffice"]);
  if (s instanceof NextResponse) return s;
  const body = await req.json().catch(() => null);
  if (!body?.action) return NextResponse.json({ error: "action is required" }, { status: 400 });

  switch (body.action) {
    case "approve_partner":
    case "suspend_partner": {
      if (!body.email) return NextResponse.json({ error: "email is required" }, { status: 400 });
      const status = body.action === "approve_partner" ? "approved" : "suspended";
      const updated = await prisma.partner.update({ where: { contactEmail: body.email.toLowerCase() }, data: { status } });
      return NextResponse.json({ data: { company: updated.company, status: updated.status } });
    }

    case "refund": {
      if (!body.reference) return NextResponse.json({ error: "reference is required" }, { status: 400 });
      const tx = await prisma.transaction.findUnique({ where: { reference: body.reference } });
      if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      if (tx.status !== "succeeded") return NextResponse.json({ error: `Cannot refund a ${tx.status} transaction` }, { status: 409 });

      // Refund to wallet + mark refunded
      const [, refunded] = await prisma.$transaction([
        prisma.user.update({ where: { id: tx.userId }, data: { walletBalanceUsd: { increment: tx.amountUsd } } }),
        prisma.transaction.update({ where: { id: tx.id }, data: { status: "refunded" } }),
      ]);
      return NextResponse.json({ data: { reference: refunded.reference, status: refunded.status, refundedToWallet: tx.amountUsd } });
    }

    case "payout": {
      if (!body.email) return NextResponse.json({ error: "email is required" }, { status: 400 });
      const partner = await prisma.partner.findUnique({ where: { contactEmail: body.email.toLowerCase() } });
      if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });
      if (partner.balanceUsd <= 0) return NextResponse.json({ error: "No balance to pay out" }, { status: 409 });

      await prisma.$transaction(async (tx) => {
        await tx.partner.update({ where: { id: partner.id }, data: { balanceUsd: 0 } });
        await tx.partnerSale.create({
          data: {
            partnerId: partner.id,
            bookingRef: "PO-" + Date.now(),
            customerName: partner.company,
            amountUsd: -partner.balanceUsd,
            commissionUsd: 0,
          },
        });
      });
      return NextResponse.json({ data: { company: partner.company, paidOutUsd: partner.balanceUsd, newBalance: 0 } });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
  }
}
