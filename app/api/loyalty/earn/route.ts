import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/loyalty/earn - Earn loyalty points
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  if (!body?.amount) {
    return NextResponse.json({ error: 'amount required' }, { status: 400 });
  }

  const points = Math.floor(body.amount * 10); // 1 USD = 10 points

  const loyalty = await prisma.loyaltyPoints.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      points: points,
      lifetimePoints: points,
    },
    update: {
      points: { increment: points },
      lifetimePoints: { increment: points },
    },
  });

  const transaction = await prisma.pointsTransaction.create({
    data: {
      userId: session.userId,
      points: points,
      type: 'earn',
      description: body.description || 'Points earned from booking',
      source: 'booking',
    },
  });

  return NextResponse.json({
    data: { loyalty, transaction },
    pointsEarned: points,
  }, { status: 201 });
}
