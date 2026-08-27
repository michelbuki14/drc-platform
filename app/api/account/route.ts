import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from '@/lib/session';

// Account overview: profile + payment methods + transactions
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      paymentMethods: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 25 },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      profile: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        role: user.role,
        walletBalanceUsd: user.walletBalanceUsd,
      },
      paymentMethods: user.paymentMethods.map((m: any) => ({
        id: m.id, kind: m.kind, label: m.label, isDefault: m.isDefault,
      })),
      transactions: user.transactions.map((t: any) => ({
        reference: t.reference,
        amountUsd: t.amountUsd,
        amountLocal: t.amountLocal,
        localCurrency: t.localCurrency,
        method: t.method,
        status: t.status,
        purpose: t.purpose,
        relatedRef: t.relatedRef,
        at: t.createdAt,
      })),
    },
  });
}

// Add a payment method
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => null);
  const { kind, identifier, label } = body ?? {};
  if (!kind || !identifier) {
    return NextResponse.json({ error: "kind and identifier are required" }, { status: 400 });
  }
  const VALID = ["mpesa", "airtel_money", "orange_money", "card", "bank_transfer"];
  if (!VALID.includes(kind)) {
    return NextResponse.json({ error: `kind must be one of ${VALID.join(", ")}` }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const KIND_LABELS: Record<string, string> = {
    mpesa: "M-Pesa", airtel_money: "Airtel Money", orange_money: "Orange Money",
    card: "Card", bank_transfer: "Bank transfer",
  };
  // Mask identifier for display
  const masked =
    kind === "card"
      ? `•••• ${String(identifier).slice(-4)}`
      : String(identifier).slice(0, -3).replace(/\d/g, "•") + String(identifier).slice(-3);

  const pm = await prisma.paymentMethod.create({
    data: {
      userId: user.id,
      kind,
      identifier,
      label: label ?? `${KIND_LABELS[kind]} ${masked}`,
    },
  });
  return NextResponse.json({ data: { id: pm.id, kind: pm.kind, label: pm.label } }, { status: 201 });
}

// Wallet top-up
export async function PUT(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => null);
  if (!body?.amountUsd) {
    return NextResponse.json({ error: "amountUsd is required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { walletBalanceUsd: { increment: Number(body.amountUsd) } },
  });
  return NextResponse.json({ data: { walletBalanceUsd: updated.walletBalanceUsd } });
}
