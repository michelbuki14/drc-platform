import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/flight-status - Get all flight statuses (with optional filters)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const flightNo = searchParams.get('flightNo');
  const airline = searchParams.get('airline');

  // If specific flightNo requested, return that one
  if (flightNo) {
    const status = await prisma.flightStatus.findFirst({
      where: { flightNo: flightNo || undefined },
      orderBy: { updatedAt: 'desc' },
    });

    if (!status) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    const flight = await prisma.flight.findUnique({
      where: { flightNo },
      include: { origin: true, destination: true, airlineRef: true },
    });

    return NextResponse.json({ data: { ...status, flight: flight || null } });
  }

  // Otherwise return all statuses, enriched with flight details
  const where: any = {};
  if (airline) where.airline = airline;

  const statuses = await prisma.flightStatus.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const flightNos = statuses.map((s) => s.flightNo);
  const flights = await prisma.flight.findMany({
    where: { flightNo: { in: flightNos } },
    include: { origin: true, destination: true, airlineRef: true },
  });
  const flightByNo = new Map(flights.map((f) => [f.flightNo, f]));

  const enriched = statuses.map((s) => ({ ...s, flight: flightByNo.get(s.flightNo) || null }));

  return NextResponse.json({ data: enriched });
}

// POST /api/flight-status - Update flight status (real-time)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.flightNo || !body?.status) {
    return NextResponse.json({ error: 'flightNo and status required' }, { status: 400 });
  }

  const updated = await prisma.flightStatus.upsert({
    where: { flightNo: body.flightNo },
    create: {
      flightNo: body.flightNo,
      status: body.status,
      gate: body.gate,
      terminal: body.terminal,
      baggageClaim: body.baggageClaim,
      estimatedArrival: body.estimatedArrival ? new Date(body.estimatedArrival) : null,
      actualArrival: body.actualArrival ? new Date(body.actualArrival) : null,
      delayMin: body.delayMin,
    },
    update: {
      status: body.status,
      gate: body.gate,
      terminal: body.terminal,
      baggageClaim: body.baggageClaim,
      estimatedArrival: body.estimatedArrival ? new Date(body.estimatedArrival) : undefined,
      actualArrival: body.actualArrival ? new Date(body.actualArrival) : undefined,
      delayMin: body.delayMin,
    },
  });

  const flight = await prisma.flight.findUnique({
    where: { flightNo: body.flightNo },
    include: { origin: true, destination: true, airlineRef: true },
  });

  return NextResponse.json({ data: { ...updated, flight: flight || null } }, { status: 201 });
}
