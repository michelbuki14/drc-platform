import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET /api/admin/revenue - Revenue analytics (admin only)
export async function GET(req: NextRequest) {
  const session = requireRole(req, 'admin');
  if (session instanceof NextResponse) return session;

  const { searchParams } = req.nextUrl;
  const period = searchParams.get('period') || 'monthly';

  const revenue = await prisma.payment.groupBy({
    by: ['createdAt'],
    _sum: { amount: true },
    _count: true,
    where: { status: 'succeeded' },
  });

  const total = await prisma.payment.aggregate({
    _sum: { amount: true },
    _count: true,
    where: { status: 'succeeded' },
  });

  const byMethod = await prisma.payment.groupBy({
    by: ['method'],
    _sum: { amount: true },
    _count: true,
    where: { status: 'succeeded' },
  });

  return NextResponse.json({
    data: {
      totalRevenue: total._sum.amount || 0,
      totalTransactions: total._count,
      byPeriod: revenue,
      byMethod,
    },
  });
}
