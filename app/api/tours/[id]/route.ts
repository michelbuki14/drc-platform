import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour) return NextResponse.json({ data: null }, { status: 404 });

  const [reviews, bookings] = await Promise.all([
    prisma.tourBooking.findMany({ where: { tourId: id }, orderBy: { date: 'desc' }, take: 20 }),
    prisma.review.findMany({ where: { targetType: 'tour', targetId: id }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);

  return NextResponse.json({
    data: {
      ...tour,
      bookings,
      reviews,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { tourId, userId, date, guests, totalUsd, notes } = body ?? {};
  if (!tourId || !userId || !date || !totalUsd) {
    return NextResponse.json({ error: 'tourId, userId, date, totalUsd required' }, { status: 400 });
  }

  const booking = await prisma.tourBooking.create({
    data: {
      reference: 'TR-' + Date.now(),
      tour: { connect: { id: tourId } },
      user: { connect: { id: userId } },
      date: new Date(date),
      guests: guests ?? 1,
      totalUsd: Number(totalUsd),
      status: 'confirmed',
      notes: notes || null,
    },
  });

  return NextResponse.json({ data: booking }, { status: 201 });
}
