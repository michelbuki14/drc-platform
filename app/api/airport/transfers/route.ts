import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

// GET /api/airport/transfers?userId=usr_test001
// POST /api/airport/transfers — book airport transfer
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;
  const transfers = await prisma.airportTransfer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json({ data: transfers });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { airportId, type, flightNo, pickupAt, address, vehicleClass } = body ?? {};
  if (!airportId || !type) {
    return NextResponse.json({ error: 'airportId, type required' }, { status: 400 });
  }
  const userId = (requireUser(req) as any).userId;
  const priceMap: Record<string, number> = { pickup: 25, dropoff: 22, private: 60, luxury: 120, shuttle: 15, business: 90, family: 70 };
  const transfer = await prisma.airportTransfer.create({
    data: {
      userId,
      airportId,
      type,
      flightNo: flightNo || null,
      pickupAt: pickupAt ? new Date(pickupAt) : null,
      address: address || null,
      vehicleClass: vehicleClass || 'standard',
      status: 'requested',
      priceUsd: priceMap[type] || 30,
    },
  });
  return NextResponse.json({ data: transfer }, { status: 201 });
}
