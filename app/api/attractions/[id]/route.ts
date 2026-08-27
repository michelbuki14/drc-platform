import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const attraction = await prisma.attraction.findUnique({ where: { id } });
  if (!attraction) return NextResponse.json({ data: null }, { status: 404 });

  const [reviews, bookings] = await Promise.all([
    prisma.attractionBooking.findMany({ where: { attractionId: id }, orderBy: { date: 'desc' }, take: 20 }),
    prisma.review.findMany({ where: { targetType: 'attraction', targetId: id }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);

  return NextResponse.json({
    data: {
      ...attraction,
      bookings,
      reviews,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { attractionId, userId, date, guests, totalUsd, notes } = body ?? {};
  if (!attractionId || !userId || !date || !totalUsd) {
    return NextResponse.json({ error: 'attractionId, userId, date, totalUsd required' }, { status: 400 });
  }

  const booking = await prisma.attractionBooking.create({
    data: {
      reference: 'ATT-B' + Date.now(),
      attractionId,
      userId,
      date: new Date(date),
      guests: guests ?? 1,
      totalUsd: Number(totalUsd),
      notes: notes || null,
    },
  });

  return NextResponse.json({ data: booking }, { status: 201 });
}
