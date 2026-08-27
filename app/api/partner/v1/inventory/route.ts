import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePartnerKey, canWrite } from '@/lib/partnerAuth';
import { withCache } from '@/lib/cache';

// GET /api/partner/v1/inventory - Available flights & hotels (paginated)
export async function GET(req: NextRequest) {
  const auth = await requirePartnerKey(req);
  if (auth instanceof NextResponse) return auth;

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1'));
  const pageSize = Math.min(50, parseInt(req.nextUrl.searchParams.get('pageSize') || '20'));
  const type = req.nextUrl.searchParams.get('type') || 'flights';

  const key = `partner:inv:${type}:${page}:${pageSize}`;
  const result = await withCache(key, async () => {
    if (type === 'hotels') {
      const [rows, total] = await Promise.all([
        prisma.hotel.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { pricePerNight: 'asc' } }),
        prisma.hotel.count(),
      ]);
      return { type: 'hotels', items: rows, total, page, pageSize };
    }
    const [rows, total] = await Promise.all([
      prisma.flight.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { departTime: 'asc' }, include: { origin: true, destination: true } }),
      prisma.flight.count(),
    ]);
    return { type: 'flights', items: rows, total, page, pageSize };
  }, 15000);

  return NextResponse.json({ data: result }, { headers: { 'Cache-Control': 'public, max-age=15' } });
}
