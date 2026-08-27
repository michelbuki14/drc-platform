import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET /api/admin/bookings - Booking analytics (admin only)
export async function GET(req: NextRequest) {
  const session = requireRole(req, 'admin');
  if (session instanceof NextResponse) return session;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const status = searchParams.get('status');
  const userId = searchParams.get('userId');
  const search = searchParams.get('search');

  const where: any = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (search) {
    where.OR = [
      { reference: { contains: search } },
      { passengerName: { contains: search } },
    ];
  }

  const [bookings, total, stats] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: true, flight: true },
    }),
    prisma.booking.count({ where }),
    prisma.booking.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  return NextResponse.json({
    data: bookings,
    total,
    page,
    limit,
    stats,
  });
}
