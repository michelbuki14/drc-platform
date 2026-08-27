import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/flights/[id] - Flight detail with origin/destination
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flight = await prisma.flight.findFirst({
    where: { OR: [{ id }, { flightNo: id }] },
    include: { origin: true, destination: true, airlineRef: true, bookings: true },
  });
  if (!flight) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  return NextResponse.json({ data: flight });
}

// PUT /api/flights/[id] - Update flight
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const flight = await prisma.flight.update({
    where: { id },
    data: {
      flightNo: body.flightNo,
      airline: body.airline,
      departTime: body.departTime,
      arriveTime: body.arriveTime,
      durationMin: body.durationMin,
      priceUsd: body.priceUsd,
      status: body.status,
      daysOfWeek: body.daysOfWeek,
    },
  });
  return NextResponse.json({ data: flight });
}
