import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/airlines/flights - All flights with airline info
export async function GET(req: NextRequest) {
  const flights = await prisma.flight.findMany({
    include: {
      origin: { select: { name: true, country: true } },
      destination: { select: { name: true, country: true } },
      airlineRef: { select: { code: true, name: true } },
    },
    orderBy: { flightNo: 'asc' },
  });
  return NextResponse.json({ data: flights, total: flights.length });
}
