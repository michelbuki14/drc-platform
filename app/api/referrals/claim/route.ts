import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/referrals/claim - Claim a referral code
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  if (!body?.code) {
    return NextResponse.json({ error: 'code required' }, { status: 400 });
  }

  const referral = await prisma.referral.findUnique({
    where: { code: body.code },
  });

  if (!referral) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
  }

  if (referral.status === 'rewarded') {
    return NextResponse.json({ error: 'Referral already rewarded' }, { status: 400 });
  }

  // Update referral to accepted
  const updated = await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: 'accepted',
      acceptedAt: new Date(),
    },
  });

  // Reward the referrer - earn points
  const points = Math.floor(referral.rewardUsd * 10);
  await prisma.loyaltyPoints.upsert({
    where: { userId: referral.userId },
    create: {
      userId: referral.userId,
      points: points,
      lifetimePoints: points,
    },
    update: {
      points: { increment: points },
      lifetimePoints: { increment: points },
    },
  });

  // Create reward transaction
  const rewardTx = await prisma.pointsTransaction.create({
    data: {
      userId: referral.userId,
      points: points,
      type: 'referral',
      description: 'Referral bonus: $' + referral.rewardUsd,
      source: 'referral',
    },
  });

  // Also credit wallet
  await prisma.user.update({
    where: { id: referral.userId },
    data: {
      walletBalanceUsd: { increment: referral.rewardUsd },
    },
  });

  return NextResponse.json({
    data: { referral: updated, pointsEarned: points, rewardUsd: referral.rewardUsd },
    message: 'Referral claimed! $' + referral.rewardUsd + ' credited',
  }, { status: 200 });
}
