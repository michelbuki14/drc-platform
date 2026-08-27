import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { withCache } from '@/lib/cache';

// GET /api/admin/analytics - Deep admin analytics (admin only)
export async function GET(req: NextRequest) {
  const session = requireRole(req, 'admin');
  if (session instanceof NextResponse) return session;

  const data = await withCache('admin:analytics', async () => {
    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 864e5);
    const last7 = new Date(now.getTime() - 7 * 864e5);

    const [
      totalUsers, totalBookings, newUsers7d,
      totalRevenue, revenue7d, totalFlights, totalHotels, totalVehicles,
      totalCargo, activePartners, pendingPartners,
      revenueByMethod, bookingsByStatus,
      topRoutes, recentBookings,
      dailyRevenue, userGrowth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.user.count({ where: { createdAt: { gte: last7 } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'succeeded' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'succeeded', createdAt: { gte: last7 } } }),
      prisma.flight.count(),
      prisma.hotel.count(),
      prisma.vehicle.count(),
      prisma.cargo.count(),
      prisma.partner.count({ where: { status: 'approved' } }),
      prisma.partner.count({ where: { status: 'pending' } }),
      prisma.payment.groupBy({ by: ['method'], _sum: { amount: true }, _count: true, where: { status: 'succeeded' } }),
      prisma.booking.groupBy({ by: ['status'], _count: true }),
      prisma.booking.groupBy({ by: ['flightId'], _count: true, orderBy: { _count: { flightId: 'desc' } }, take: 5 }),
      prisma.booking.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: true, flight: true } }),
      // 30-day daily revenue series
      prisma.payment.findMany({
        where: { status: 'succeeded', createdAt: { gte: last30 } },
        select: { amount: true, createdAt: true },
      }),
      prisma.user.findMany({ where: { createdAt: { gte: last30 } }, select: { createdAt: true } }),
    ]);

    // bucket daily revenue
    const revMap = new Map<string, number>();
    for (const p of dailyRevenue) {
      const d = p.createdAt.toISOString().slice(0, 10);
      revMap.set(d, (revMap.get(d) || 0) + (p.amount || 0));
    }
    const revenueSeries = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now.getTime() - (29 - i) * 864e5).toISOString().slice(0, 10);
      return { date: d, revenue: Math.round((revMap.get(d) || 0) * 100) / 100 };
    });
    const userSeries = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now.getTime() - (29 - i) * 864e5).toISOString().slice(0, 10);
      return d;
    });
    const userGrowthSet = new Set(userGrowth.map((u: any) => u.createdAt.toISOString().slice(0, 10)));
    const userSeriesCount = userSeries.map((d) => ({ date: d, signups: userGrowthSet.has(d) ? 1 : 0 }));

    // Resolve top routes labels
    const flightIds = topRoutes.map((r: any) => r.flightId).filter(Boolean);
    const flights = flightIds.length ? await prisma.flight.findMany({ where: { id: { in: flightIds } }, include: { origin: true, destination: true } }) : [];
    const fmap = new Map(flights.map((f: any) => [f.id, `${f.origin?.name ?? ''}→${f.destination?.name ?? ''}`]));
    const topRoutesLabeled = topRoutes.map((r: any) => ({ route: fmap.get(r.flightId) || r.flightId, bookings: r._count.flightId }));

    return {
      stats: {
        totalUsers, totalBookings, newUsers7d,
        totalRevenue: totalRevenue._sum.amount || 0,
        revenue7d: revenue7d._sum.amount || 0,
        totalFlights, totalHotels, totalVehicles,
        totalCargo, activePartners, pendingPartners,
      },
      revenueByMethod,
      bookingsByStatus,
      topRoutes: topRoutesLabeled,
      recentBookings,
      revenueSeries,
      userSeries: userSeriesCount,
    };
  }, 60000);

  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'private, max-age=30' } });
}
