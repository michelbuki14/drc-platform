import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/partner/sales — list recent sales for the partner portal
// POST /api/partner/sales — record a new partner-referred sale
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const email = searchParams.get('email');

  const partner = await prisma.partner.findFirst({
    where: email ? { contactEmail: email.toLowerCase() } : { status: 'approved' },
    orderBy: { createdAt: 'asc' },
  });
  if (!partner) return NextResponse.json({ error: 'No partner found' }, { status: 404 });

  const sales = await prisma.partnerSale.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    data: sales.map((s) => ({
      id: s.id,
      productType: 'sale',
      productRef: s.bookingRef,
      customerName: s.customerName,
      amountUsd: s.amountUsd,
      commissionUsd: s.commissionUsd,
      createdAt: s.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { bookingRef, customerName, amountUsd } = body ?? {};
  if (!bookingRef || !customerName || !amountUsd) {
    return NextResponse.json(
      { error: 'bookingRef, customerName and amountUsd are required' },
      { status: 400 }
    );
  }

  const partner = await prisma.partner.findFirst({
    where: { status: 'approved' },
    orderBy: { createdAt: 'asc' },
  });
  if (!partner) return NextResponse.json({ error: 'No approved partner' }, { status: 404 });

  const commissionUsd = (Number(amountUsd) * partner.commissionPct) / 100;

  const sale = await prisma.$transaction(async (tx) => {
    const s = await tx.partnerSale.create({
      data: {
        partnerId: partner.id,
        bookingRef,
        customerName,
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
    { data: { saleId: sale.id, amountUsd: sale.amountUsd, commissionUsd: sale.commissionUsd } },
    { status: 201 }
  );
}
