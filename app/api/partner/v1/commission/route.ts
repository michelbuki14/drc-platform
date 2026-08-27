import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePartnerKey } from '@/lib/partnerAuth';

// GET /api/partner/v1/commission - Partner commission balance + lifetime totals
export async function GET(req: NextRequest) {
  const auth = await requirePartnerKey(req);
  if (auth instanceof NextResponse) return auth;

  const user = await prisma.user.findUnique({ where: { id: auth.partnerId } });
  const partner = user ? await prisma.partner.findUnique({ where: { contactEmail: user.email } }) : null;
  if (!partner) return NextResponse.json({ error: 'Partner not found for this key' }, { status: 404 });

  const [lifetime, count] = await Promise.all([
    prisma.partnerSale.aggregate({ _sum: { amountUsd: true, commissionUsd: true }, where: { partnerId: partner.id } }),
    prisma.partnerSale.count({ where: { partnerId: partner.id } }),
  ]);

  return NextResponse.json({
    data: {
      company: partner.company,
      status: partner.status,
      commissionPct: partner.commissionPct,
      balanceUsd: partner.balanceUsd,
      lifetimeSalesUsd: lifetime._sum.amountUsd || 0,
      lifetimeCommissionUsd: lifetime._sum.commissionUsd || 0,
      saleCount: count,
    },
  });
}
