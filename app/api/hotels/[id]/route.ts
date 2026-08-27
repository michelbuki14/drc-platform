import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomBytes } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) return NextResponse.json({ data: null }, { status: 404 });

  const [reviews, bookings] = await Promise.all([
    prisma.hotelReview.findMany({ where: { hotelId: id }, orderBy: { created: 'desc' }, take: 50 }),
    prisma.hotelBooking.findMany({ where: { hotelId: id }, orderBy: { checkIn: 'desc' }, take: 20 }),
  ]);

  const totalReviews = await prisma.hotelReview.count({ where: { hotelId: id } });
  const avgRating = totalReviews > 0
    ? (await prisma.hotelReview.aggregate({ where: { hotelId: id }, _avg: { rating: true } })
        .then(r => r._avg.rating || 0))
    : 0;

  return NextResponse.json({
    data: {
      ...hotel,
      reviewCount: totalReviews,
      avgRating,
      reviews,
      recentBookings: bookings,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { hotelId, guestName, email, phone, checkIn, checkOut, guests, roomType, totalUsd, status, userId, notes } = body ?? {};
  if (!hotelId || !guestName || !email || !checkIn || !checkOut || !totalUsd) {
    return NextResponse.json({ error: 'hotelId, guestName, email, checkIn, checkOut, totalUsd required' }, { status: 400 });
  }

  const booking = await prisma.hotelBooking.create({
    data: {
      hotelId,
      guestName,
      email,
      phone: phone || null,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: guests || 1,
      roomType: roomType || 'standard',
      totalUsd: Number(totalUsd),
      status: status || 'pending',
      userId: userId || null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ data: booking }, { status: 201 });
}
