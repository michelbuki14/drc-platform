import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePartnerKey, canWrite } from '@/lib/partnerAuth';

// GET /api/partner/v1/bookings - List this partner's recorded sales
export async function GET(req: NextRequest) {
  const auth = await requirePartnerKey(req);
  if (auth instanceof NextResponse) return auth;

  const partner = await prisma.partner.findUnique({ where: { contactEmail: (await prisma.user.findUnique({ where: { id: auth.partnerId } }))?.email || '__none__' } });
  const partnerId = partner?.id;
  const sales = partnerId
    ? await prisma.partnerSale.findMany({ where: { partnerId }, orderBy: { createdAt: 'desc' }, take: 50 })
    : [];
  return NextResponse.json({ data: { sales } });
}

// POST /api/partner/v1/bookings - Record a partner-mediated sale (write scope)
export async function POST(req: NextRequest) {
  const auth = await requirePartnerKey(req);
  if (auth instanceof NextResponse) return auth;
  if (!canWrite(auth)) return NextResponse.json({ error: 'API key lacks write permission' }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id: auth.partnerId } });
  const partner = user ? await prisma.partner.findUnique({ where: { contactEmail: user.email } }) : null;
  if (!partner) return NextResponse.json({ error: 'Partner not found for this key' }, { status: 404 });
  if (partner.status !== 'approved') return NextResponse.json({ error: `Partner is ${partner.status}` }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { bookingRef, customerName, amountUsd } = body ?? {};
  if (!bookingRef || !customerName || !amountUsd) {
    return NextResponse.json({ error: 'bookingRef, customerName, amountUsd required' }, { status: 400 });
  }

  const commissionUsd = (Number(amountUsd) * partner.commissionPct) / 100;
  const sale = await prisma.$transaction(async (tx) => {
    const s = await tx.partnerSale.create({ data: { partnerId: partner.id, bookingRef, customerName, amountUsd: Number(amountUsd), commissionUsd } });
    await tx.partner.update({ where: { id: partner.id }, data: { balanceUsd: { increment: commissionUsd } } });
    return s;
  });

  return NextResponse.json({ data: { saleId: sale.id, amountUsd: sale.amountUsd, commissionUsd: sale.commissionUsd } }, { status: 201 });
}
