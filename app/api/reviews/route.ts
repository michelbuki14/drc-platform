import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');

  if (id) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ review });
  }

  // List reviews by target
  const targetType = searchParams.get('targetType') ?? searchParams.get('type');
  const targetId = searchParams.get('targetId') ?? searchParams.get('id') ?? null;

  const where: any = {};
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = targetId;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => ({}));
  const { targetType, targetId, rating, title, review } = body;

  if (!targetType || !targetId || rating == null || !review) {
    return NextResponse.json({ error: 'targetType, targetId, rating, review required' }, { status: 400 });
  }

  const reviewRecord = await prisma.review.create({
    data: {
      targetType,
      targetId,
      rating: Math.max(1, Math.min(5, Number(rating))),
      title: title || review.slice(0, 100),
      review,
      userId: session.userId,
      helpfulness: 0,
    },
  });

  return NextResponse.json({ review: reviewRecord }, { status: 201 });
}
