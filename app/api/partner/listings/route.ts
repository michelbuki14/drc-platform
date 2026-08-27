import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/partner/listings - Partner listings management
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const partnerId = searchParams.get('partnerId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  if (!partnerId) {
    return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
  }

  const [flights, total] = await Promise.all([
    prisma.flight.findMany({
      where: { airlineId: partnerId },
      skip: offset,
      take: limit,
      orderBy: { flightNo: 'desc' },
      include: { origin: true, destination: true },
    }),
    prisma.flight.count({ where: { airlineId: partnerId } }),
  ]);

  return NextResponse.json({ data: flights, total, page, limit });
}

// POST /api/partner/listings - Add new flight listing
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.partnerId || !body?.flightNo || !body?.flight) {
    return NextResponse.json({ error: 'partnerId, flightNo, flight required' }, { status: 400 });
  }

  const flight = await prisma.flight.create({
    data: {
      flightNo: body.flightNo,
      airline: body.flight.airline,
      airlineId: body.partnerId,
      originId: body.flight.originId,
      destinationId: body.flight.destinationId,
      departTime: body.flight.departTime,
      arriveTime: body.flight.arriveTime,
      durationMin: body.flight.durationMin,
      priceUsd: body.flight.priceUsd,
      daysOfWeek: body.flight.daysOfWeek || '1,2,3,4,5,6,7',
      status: 'scheduled',
    },
    include: { origin: true, destination: true },
  });

  return NextResponse.json({ data: flight }, { status: 201 });
}
