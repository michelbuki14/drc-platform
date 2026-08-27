import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

// Partner portal data: profile + sales + commission balance
// The caller must be authenticated; we resolve the partner by the authenticated
// user's email so one partner cannot read another's data.
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  // Resolve partner from the logged-in user's email (ownership enforced).
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const partner = await prisma.partner.findUnique({
    where: { contactEmail: user.email },
    include: { sales: { orderBy: { createdAt: "desc" }, take: 25 } },
  });
  if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  const totalSales = partner.sales.reduce((s: number, x: any) => s + x.amountUsd, 0);
  const totalCommission = partner.sales.reduce((s: number, x: any) => s + x.commissionUsd, 0);

  return NextResponse.json({
    data: {
      profile: {
        company: partner.company,
        category: partner.category,
        status: partner.status,
        commissionPct: partner.commissionPct,
        balanceUsd: partner.balanceUsd,
      },
      stats: {
        totalSalesUsd: Math.round(totalSales * 100) / 100,
        totalCommissionUsd: Math.round(totalCommission * 100) / 100,
        saleCount: partner.sales.length,
      },
      sales: partner.sales.map((s) => ({
        bookingRef: s.bookingRef,
        amountUsd: s.amountUsd,
        commissionUsd: s.commissionUsd,
        at: s.createdAt,
      })),
    },
  });
}

// Partner records a sale (must own the partner account)
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const { bookingRef, customerName, amountUsd } = body ?? {};
  if (!bookingRef || !customerName || !amountUsd) {
    return NextResponse.json({ error: "bookingRef, customerName and amountUsd are required" }, { status: 400 });
  }

  const partner = await prisma.partner.findUnique({ where: { contactEmail: user.email } });
  if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  if (partner.status !== "approved") {
    return NextResponse.json({ error: `Partner account is ${partner.status} — cannot record sales` }, { status: 403 });
  }

  const commissionUsd = (Number(amountUsd) * partner.commissionPct) / 100;
  const sale = await prisma.$transaction(async (tx) => {
    const s = await tx.partnerSale.create({
      data: {
        partnerId: partner.id,
        bookingRef,
        customerName: customerName || "Unknown",
        amountUsd: Number(amountUsd),
        commissionUsd,
      },
    });
    await tx.partner.update({
      where: { id: partner.id },
      data: { balanceUsd: { increment: commissionUsd } },
    });
    return s;
  });

  return NextResponse.json(
    {
      data: {
        saleId: sale.id,
        amountUsd: sale.amountUsd,
        commissionUsd: sale.commissionUsd,
        note: `${partner.commissionPct}% commission credited to partner balance`,
      },
    },
    { status: 201 }
  );
}
