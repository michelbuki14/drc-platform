import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCache } from '@/lib/cache';

// Unified, paginated, filterable search across the catalogue.
// Query params: q, type (all|flights|hotels|vehicles|tours|cargo|services),
//   minPrice, maxPrice, sort (price|name|date|rating), order (asc|desc),
//   page, pageSize. Returns { data: Result[], total, page, pageSize, facets }.

interface Result {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  price?: number;
  href: string;
  image?: string | null;
  rating?: number | null;
  extra?: any;
}

function isEmpty(q: string) {
  return !q || !q.trim();
}

async function searchAll(params: URLSearchParams): Promise<{ data: Result[]; total: number }> {
  const q = (params.get('q') || '').toLowerCase().trim();
  const type = params.get('type') || 'all';
  const min = parseFloat(params.get('minPrice') || '0') || 0;
  const max = parseFloat(params.get('maxPrice') || '999999') || 999999;
  const sort = params.get('sort') || 'price';
  const order = params.get('order') === 'desc' ? 'desc' : 'asc';
  const page = Math.max(1, parseInt(params.get('page') || '1') || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(params.get('pageSize') || '12') || 12));
  const skip = (page - 1) * pageSize;

  const results: Result[] = [];
  const counts: Record<string, number> = {};

  const orderBy = (field: string) => (sort === 'name' ? { [field]: order } : sort === 'rating' ? { [field]: order } : { [field]: order });
  const priceField: Record<string, string> = { flights: 'priceUsd', hotels: 'pricePerNight', vehicles: 'dailyRateUsd', tours: 'perPersonUsd', services: 'priceUsd' };

  if (type === 'all' || type === 'flights') {
    const where = isEmpty(q)
      ? { priceUsd: { gte: min, lte: max } }
      : { AND: [{ priceUsd: { gte: min, lte: max } }, { OR: [{ flightNo: { contains: q } }, { airline: { contains: q } }, { origin: { is: { name: { contains: q } } } }, { destination: { is: { name: { contains: q } } } }] }] };
    const [rows, total] = await Promise.all([
      prisma.flight.findMany({ where, include: { origin: true, destination: true }, orderBy: orderBy('priceUsd'), skip, take: pageSize }),
      prisma.flight.count({ where }),
    ]);
    counts.flights = total;
    if (type === 'all' || type === 'flights') results.push(...rows.map((f: any) => ({
      type: 'flights', id: f.id, title: `${f.airline} ${f.flightNo}`, subtitle: `${f.origin?.name ?? ''} → ${f.destination?.name ?? ''}`,
      price: f.priceUsd, href: `/flights`, image: f.image, extra: { flightNo: f.flightNo },
    })));
  }

  if (type === 'all' || type === 'hotels') {
    const pf = priceField.hotels;
    const where = isEmpty(q)
      ? { [pf]: { gte: min, lte: max } }
      : { AND: [{ [pf]: { gte: min, lte: max } }, { OR: [{ name: { contains: q } }, { city: { contains: q } }, { description: { contains: q } }] }] };
    const [rows, total] = await Promise.all([
      prisma.hotel.findMany({ where, orderBy: orderBy(pf), skip, take: pageSize }),
      prisma.hotel.count({ where }),
    ]);
    counts.hotels = total;
    results.push(...rows.map((h: any) => ({ type: 'hotels', id: h.id, title: h.name, subtitle: `${h.city}, ${h.country}`, price: h.pricePerNight, href: `/hotels`, image: h.image, rating: h.starRating, extra: { city: h.city } })));
  }

  if (type === 'all' || type === 'vehicles') {
    const pf = priceField.vehicles;
    const where = isEmpty(q)
      ? { [pf]: { gte: min, lte: max } }
      : { AND: [{ [pf]: { gte: min, lte: max } }, { OR: [{ name: { contains: q } }, { brand: { contains: q } }, { model: { contains: q } }] }] };
    const [rows, total] = await Promise.all([
      prisma.vehicle.findMany({ where, orderBy: orderBy(pf), skip, take: pageSize }),
      prisma.vehicle.count({ where }),
    ]);
    counts.vehicles = total;
    results.push(...rows.map((v: any) => ({ type: 'vehicles', id: v.id, title: `${v.brand} ${v.model}`, subtitle: `${v.category} · ${v.seats} seats`, price: v.dailyRateUsd, href: `/vehicles`, image: v.image, extra: { category: v.category } })));
  }

  if (type === 'all' || type === 'tours') {
    const pf = priceField.tours;
    const where = isEmpty(q)
      ? { [pf]: { gte: min, lte: max } }
      : { AND: [{ [pf]: { gte: min, lte: max } }, { OR: [{ name: { contains: q } }, { city: { contains: q } }, { description: { contains: q } }] }] };
    const [rows, total] = await Promise.all([
      prisma.tour.findMany({ where, orderBy: orderBy(pf), skip, take: pageSize }),
      prisma.tour.count({ where }),
    ]);
    counts.tours = total;
    results.push(...rows.map((t: any) => ({ type: 'tours', id: t.id, title: t.name, subtitle: `${t.city}, ${t.country}`, price: t.perPersonUsd, href: `/tours`, image: t.image, rating: t.rating, extra: { city: t.city } })));
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Sort unified results for cross-type views
  if (type === 'all') {
    results.sort((a, b) => {
      if (sort === 'price') return order === 'asc' ? (a.price ?? 0) - (b.price ?? 0) : (b.price ?? 0) - (a.price ?? 0);
      return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    });
  }

  return { data: results, total };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  // Cache reads (GET) for 30s to reduce DB load; key includes the full query.
  const key = 'search:' + searchParams.toString();
  const build = () => searchAll(searchParams);
  const { data, total } = await withCache(key, build, 30000);

  // Facets: counts per type (cheap, DB-backed)
  return NextResponse.json({ data, total }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } });
}
