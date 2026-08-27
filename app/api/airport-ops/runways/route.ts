import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/airport-ops/runways - All runways
export async function GET(req: NextRequest) {
  const runways = await prisma.airportRunway.findMany({
    include: {
      airport: { select: { code: true, name: true } },
    },
    orderBy: { code: 'asc' },
  });
  return NextResponse.json({ data: runways, total: runways.length });
}

// POST /api/airport-ops/runways - Create runway
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.airportId || !body?.code || !body?.lengthM || !body?.widthM) {
    return NextResponse.json({ error: 'airportId, code, lengthM, widthM required' }, { status: 400 });
  }

  const runway = await prisma.airportRunway.create({
    data: {
      airportId: body.airportId,
      code: body.code,
      lengthM: body.lengthM,
      widthM: body.widthM,
      status: body.status || 'active',
    },
  });
  return NextResponse.json({ data: runway }, { status: 201 });
}
