import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/commission?partnerId=me — commission ledger + recent sales for the partner portal
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

  const totalSales = sales.reduce((s: number, x: any) => s + x.amountUsd, 0);
  const totalCommission = sales.reduce((s: number, x: any) => s + x.commissionUsd, 0);

  return NextResponse.json({
    data: {
      ledger: {
        balanceUsd: partner.balanceUsd,
        totalSalesUsd: Math.round(totalSales * 100) / 100,
        totalCommissionUsd: Math.round(totalCommission * 100) / 100,
        commissionPct: partner.commissionPct,
        recentSales: sales.map((s) => ({
          id: s.id,
          productType: 'sale',
          productRef: s.bookingRef,
          customerName: s.customerName,
          amountUsd: s.amountUsd,
          commissionUsd: s.commissionUsd,
          createdAt: s.createdAt,
        })),
      },
    },
  });
}
