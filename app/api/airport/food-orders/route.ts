import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

// GET /api/airport/food-orders?userId=usr_test001
// POST /api/airport/food-orders — place food order
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;
  const orders = await prisma.airportFoodOrder.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json({ data: orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { diningId, items, mode, totalUsd } = body ?? {};
  if (!diningId || !items || !Array.isArray(items)) {
    return NextResponse.json({ error: 'diningId, items required' }, { status: 400 });
  }
  const userId = (requireUser(req) as any).userId;
  const order = await prisma.airportFoodOrder.create({
    data: {
      userId,
      diningId,
      items: JSON.stringify(items),
      mode: mode || 'pickup',
      totalUsd: Number(totalUsd) || 0,
      status: 'placed',
    },
  });
  return NextResponse.json({ data: order }, { status: 201 });
}
