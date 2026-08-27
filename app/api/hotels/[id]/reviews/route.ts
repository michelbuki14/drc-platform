import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const reviewSlimSchema = z.object({
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email().max(255),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().max(1000).optional().default(''),
  cleanliness: z.coerce.number().min(1).max(5).optional().default(5),
  location: z.coerce.number().min(1).max(5).optional().default(5),
  staff: z.coerce.number().min(1).max(5).optional().default(5),
  value: z.coerce.number().min(1).max(5).optional().default(5),
});

const reviewFullSchema = reviewSlimSchema.extend({
  hotelId: z.string().min(1),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hotelId } = await params;

    if (!hotelId) {
      return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
    }

    const reviews = await prisma.hotelReview.findMany({
      where: { hotelId },
      orderBy: { created: 'desc' },
      take: 50,
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        rating: true,
        comment: true,
        cleanliness: true,
        location: true,
        staff: true,
        value: true,
        created: true,
      },
    });

    const stats = await prisma.hotelReview.aggregate({
      where: { hotelId },
      _avg: { rating: true, cleanliness: true, location: true, staff: true, value: true },
      _count: true,
    });

    return NextResponse.json({
      data: reviews,
      stats: {
        total: stats._count,
        averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
        averageCleanliness: stats._avg.cleanliness ? Math.round(stats._avg.cleanliness * 10) / 10 : 0,
        averageLocation: stats._avg.location ? Math.round(stats._avg.location * 10) / 10 : 0,
        averageStaff: stats._avg.staff ? Math.round(stats._avg.staff * 10) / 10 : 0,
        averageValue: stats._avg.value ? Math.round(stats._avg.value * 10) / 10 : 0,
      },
    });
  } catch (err: any) {
    console.error('Hotel reviews error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hotelId } = await params;

    if (!hotelId) {
      return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = reviewFullSchema.safeParse({ ...body, hotelId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid review data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { status: true },
    });

    if (!hotel || hotel.status !== 'active') {
      return NextResponse.json({ error: 'Hotel not found or not active' }, { status: 404 });
    }

    const review = await prisma.hotelReview.create({
      data: {
        hotelId,
        guestName: data.guestName,
        guestEmail: data.guestEmail.toLowerCase(),
        rating: data.rating,
        comment: data.comment || '',
        cleanliness: data.cleanliness,
        location: data.location,
        staff: data.staff,
        value: data.value,
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (err: any) {
    console.error('Hotel review creation error:', err);
    return NextResponse.json(
      { error: 'Failed to create review', details: err.message },
      { status: 500 }
    );
  }
}
