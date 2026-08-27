import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/partner/dashboard - Partner portal dashboard
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
  }

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: { sales: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  const [totalSales, totalCommission] = await Promise.all([
    prisma.partnerSale.count({ where: { partnerId } }),
    prisma.partnerSale.aggregate({ _sum: { commissionUsd: true }, where: { partnerId } }),
  ]);

  const balance = partner.balanceUsd;

  return NextResponse.json({
    data: {
      partner,
      stats: { totalSales, totalCommission: totalCommission._sum.commissionUsd || 0, balance },
    },
  });
}
