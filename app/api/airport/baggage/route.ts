import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

// GET /api/airport/baggage?userId=usr_test001  (or ?flightNo=CC-101 for allowance)
// POST /api/airport/baggage — track / report delayed / lost / extra
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;
  const flightNo = req.nextUrl.searchParams.get('flightNo');
  if (flightNo) {
    const allowance = await prisma.baggageAllowance.findMany({ where: { flightNo } });
    return NextResponse.json({ data: { allowance } });
  }
  if (!userId) return NextResponse.json({ error: 'userId or flightNo required' }, { status: 400 });
  const services = await prisma.baggageService.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json({ data: services });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { flightNo, type, description, claimArea } = body ?? {};
  if (!type) {
    return NextResponse.json({ error: 'type required' }, { status: 400 });
  }
  const userId = (requireUser(req) as any).userId;
  const service = await prisma.baggageService.create({
    data: {
      userId,
      flightNo: flightNo || null,
      type,
      description: description || null,
      claimArea: claimArea || null,
      status: 'open',
      priceUsd: type === 'extra' ? 50 : 0,
    },
  });
  return NextResponse.json({ data: service }, { status: 201 });
}
