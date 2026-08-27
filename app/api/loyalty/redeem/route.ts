import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/loyalty/redeem - Redeem loyalty points
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  if (!body?.pointsToRedeem) {
    return NextResponse.json({ error: 'pointsToRedeem required' }, { status: 400 });
  }

  const loyalty = await prisma.loyaltyPoints.findUnique({
    where: { userId: session.userId },
  });

  if (!loyalty || loyalty.points < body.pointsToRedeem) {
    return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
  }

  // 100 points = $1
  const usdValue = body.pointsToRedeem / 100;

  const updated = await prisma.loyaltyPoints.update({
    where: { userId: session.userId },
    data: {
      points: { decrement: body.pointsToRedeem },
    },
  });

  const transaction = await prisma.pointsTransaction.create({
    data: {
      userId: session.userId,
      points: -body.pointsToRedeem,
      type: 'redeem',
      description: body.description || 'Points redeemed',
      source: 'redemption',
    },
  });

  return NextResponse.json({
    data: { loyalty: updated, transaction },
    usdValue,
  }, { status: 200 });
}
