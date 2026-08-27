import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET /api/admin/dashboard - Admin analytics dashboard (admin only)
export async function GET(req: NextRequest) {
  const session = requireRole(req, 'admin');
  if (session instanceof NextResponse) return session;

  const [
    totalUsers,
    totalBookings,
    totalRevenue,
    totalFlights,
    totalVehicles,
    totalHotels,
    totalAttractions,
    totalTours,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'succeeded' } }),
    prisma.flight.count(),
    prisma.vehicle.count(),
    prisma.hotel.count(),
    prisma.attraction.count(),
    prisma.tour.count(),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true, flight: true },
    }),
  ]);

  return NextResponse.json({
    data: {
      stats: {
        totalUsers,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalFlights,
        totalVehicles,
        totalHotels,
        totalAttractions,
        totalTours,
      },
      recentBookings,
    },
  });
}
