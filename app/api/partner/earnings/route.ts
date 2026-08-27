import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/partner/earnings - Partner earnings
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
  }

  const [sales, totalCommission, balance] = await Promise.all([
    prisma.partnerSale.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.partnerSale.aggregate({ _sum: { commissionUsd: true }, where: { partnerId } }),
    prisma.partner.findUnique({
      where: { id: partnerId },
      select: { balanceUsd: true },
    }),
  ]);

  return NextResponse.json({
    data: {
      sales,
      totalEarnings: totalCommission._sum.commissionUsd || 0,
      balance: balance?.balanceUsd || 0,
    },
  });
}
