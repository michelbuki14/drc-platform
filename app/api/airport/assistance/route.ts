import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

// GET /api/airport/assistance?userId=usr_test001
// POST /api/airport/assistance — request passenger assistance / concierge
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;
  const items = await prisma.airportAssistance.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json({ data: items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { airportId, type, flightNo, partySize, notes } = body ?? {};
  if (!airportId || !type) {
    return NextResponse.json({ error: 'airportId, type required' }, { status: 400 });
  }
  const userId = (requireUser(req) as any).userId;
  const priceMap: Record<string, number> = {
    meet_assist: 40, fast_track: 35, vip: 150, porter: 20, wheelchair: 25,
    elderly: 30, child: 30, interpreter: 50, business_concierge: 120, escort: 45,
    personal_assistant: 100, translation: 45, shopping: 40,
  };
  const item = await prisma.airportAssistance.create({
    data: {
      userId,
      airportId,
      type,
      flightNo: flightNo || null,
      partySize: partySize || 1,
      notes: notes || null,
      status: 'requested',
      priceUsd: priceMap[type] || 30,
    },
  });
  return NextResponse.json({ data: item }, { status: 201 });
}
