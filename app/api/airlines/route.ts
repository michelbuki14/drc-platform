import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ─── AIRLINES PORTAL ───────────────────────────────────────────────────

// GET /api/airlines - List all airlines
export async function GET(req: NextRequest) {
  const airlines = await prisma.airline.findMany({
    include: {
      _count: { select: { aircraft: true, flights: true } },
    },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ data: airlines, total: airlines.length });
}

// POST /api/airlines - Create airline
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.code || !body?.name) {
    return NextResponse.json({ error: 'code and name required' }, { status: 400 });
  }

  const exists = await prisma.airline.findUnique({ where: { code: body.code } });
  if (exists) return NextResponse.json({ error: 'Airline code already exists' }, { status: 409 });

  const airline = await prisma.airline.create({
    data: {
      code: body.code,
      name: body.name,
      country: body.country || 'CD',
      logo: body.logo,
      website: body.website,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      status: body.status || 'active',
    },
  });
  return NextResponse.json({ data: airline }, { status: 201 });
}
