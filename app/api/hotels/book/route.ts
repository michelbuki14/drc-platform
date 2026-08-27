import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const bookingSchema = z.object({
  hotelId: z.string().min(1),
  guestName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  checkIn: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  checkOut: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  guests: z.coerce.number().min(1).max(20).optional().default(1),
  roomType: z.enum(['standard', 'deluxe', 'suite', 'family']).optional().default('standard'),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: 'Check-out must be after check-in' },
        { status: 400 }
      );
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights < 1) {
      return NextResponse.json(
        { error: 'Minimum stay is 1 night' },
        { status: 400 }
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: data.hotelId },
    });

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    if (hotel.status !== 'active') {
      return NextResponse.json({ error: 'Hotel is not available' }, { status: 400 });
    }

    const totalUsd = hotel.pricePerNight * nights;

    const booking = await prisma.hotelBooking.create({
      data: {
        hotelId: data.hotelId,
        guestName: data.guestName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        checkIn,
        checkOut,
        guests: data.guests,
        roomType: data.roomType,
        totalUsd,
        status: 'confirmed',
        notes: data.notes,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: {
          ...booking,
          nights,
          bookingReference: booking.id.slice(0, 8).toUpperCase(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Hotel booking error:', err);
    return NextResponse.json(
      { error: 'Failed to create booking', details: err.message },
      { status: 500 }
    );
  }
}
