import { NextRequest, NextResponse } from "next/server";
import { crypto } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { chargeWithProvider } from "@/lib/payments/provider";

const METHODS = ["mpesa", "airtel_money", "orange_money", "card", "bank_transfer", "wallet"];
const CDF_RATE = 2850; // USD→CDF display rate

function ref(method: string) {
  const p = { mpesa: "MP", airtel_money: "AM", orange_money: "OM", card: "CD", bank_transfer: "BT", wallet: "WL" }[method] ?? "NX";
  return `TX-${p}-${crypto.randomBytes(3).toString("hex").toUpperCase()}${Date.now() % 10000}`;
}

export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const { method, amountUsd, purpose, relatedRef, phone, cardToken } = body ?? {};
  if (!method || !amountUsd) {
    return NextResponse.json({ error: "method and amountUsd are required" }, { status: 400 });
  }
  if (!METHODS.includes(method)) {
    return NextResponse.json({ error: `method must be one of ${METHODS.join(", ")}` }, { status: 400 });
  }
  const amt = Number(amountUsd);
  if (!Number.isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: "amountUsd must be a positive number" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Wallet rail — real internal ledger deduction.
  if (method === "wallet") {
    if (user.walletBalanceUsd < amt) {
      return NextResponse.json({ error: `Insufficient wallet balance ($${user.walletBalanceUsd.toFixed(2)})` }, { status: 402 });
    }
    const reference = ref("wallet");
    const [tx, payment] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          reference,
          userId: user.id,
          amountUsd: amt,
          method: "wallet",
          providerRef: "WALLET-" + reference,
          status: "succeeded",
          purpose: purpose ?? "service",
          relatedRef: relatedRef ?? null,
          completedAt: new Date(),
        },
      }),
      prisma.payment.create({
        data: { userId: user.id, amount: amt, currency: "USD", method: "wallet", status: "succeeded", description: purpose ?? "Wallet payment", reference: reference },
      }),
      prisma.user.update({ where: { id: user.id }, data: { walletBalanceUsd: { decrement: amt } } }),
    ]);
    return NextResponse.json({
      data: { reference, status: "succeeded", amountUsd: amt, remainingBalance: user.walletBalanceUsd - amt },
    });
  }

  // External providers via the abstraction.
  const result = await chargeWithProvider(method, {
    amountUsd: amt,
    currency: "USD",
    phone,
    cardToken,
    description: purpose,
    reference: ref(method),
  });

  if (result.status === "not_configured") {
    return NextResponse.json(
      { error: `Payment method "${method}" is not configured on this server. Add provider credentials to enable it.` },
      { status: 501 }
    );
  }

  const isLocalMoney = ["mpesa", "airtel_money", "orange_money"].includes(method);
  const dbStatus = result.status === "succeeded" ? "succeeded" : "pending";
  const reference = ref(method);

  const [tx, payment] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        reference,
        userId: user.id,
        amountUsd: amt,
        ...(isLocalMoney ? { amountLocal: Math.round(amt * CDF_RATE), localCurrency: "CDF" } : {}),
        method,
        providerRef: result.providerRef,
        status: dbStatus,
        purpose: purpose ?? "service",
        relatedRef: relatedRef ?? null,
        ...(dbStatus === "succeeded" ? { completedAt: new Date() } : {}),
      },
    }),
    prisma.payment.create({
      data: {
        userId: user.id,
        amount: amt,
        currency: "USD",
        method,
        status: dbStatus,
        description: purpose ?? "Payment",
        reference,
        metadata: JSON.stringify({ providerRef: result.providerRef }),
      },
    }),
  ]);

  if (dbStatus === "succeeded") {
    return NextResponse.json({
      data: { reference, status: "succeeded", amountUsd: amt, providerRef: result.providerRef },
    });
  }
  return NextResponse.json({
    data: { reference, status: "pending", amountUsd: amt, providerRef: result.providerRef, note: "Awaiting provider confirmation" },
  }, { status: 202 });
}
