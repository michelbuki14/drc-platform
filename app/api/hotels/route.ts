import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city')?.toLowerCase();
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minStars = searchParams.get('minStars');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  const where: any = {};
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (minPrice) where.pricePerNight = { gte: parseFloat(minPrice) };
  if (maxPrice) where.pricePerNight = { ...where.pricePerNight, lte: parseFloat(maxPrice) };
  if (minStars) where.starRating = { gte: parseFloat(minStars) };

  const hotels = await prisma.hotel.findMany({
    where,
    orderBy: { starRating: 'desc' },
  });

  // Calculate nights if dates provided
  const nights = (checkIn && checkOut) ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 1;
  const guestCount = parseInt(guests || '1');

  const results = hotels.map(h => ({
    ...h,
    priceForStay: h.pricePerNight * nights * guestCount,
    nights,
    guestCount,
  }));

  return NextResponse.json({ data: results });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, address, city, country, latitude, longitude, phone, email, website, starRating, pricePerNight, amenities, description, image, status } = body ?? {};
  if (!name || !city || !pricePerNight) {
    return NextResponse.json({ error: 'name, city, pricePerNight required' }, { status: 400 });
  }

  const hotel = await prisma.hotel.create({
    data: {
      name,
      address: address || '',
      city: city,
      country: country || 'CD',
      latitude: latitude || 0,
      longitude: longitude || 0,
      phone: phone || null,
      email: email || null,
      website: website || null,
      starRating: starRating || 3,
      pricePerNight: Number(pricePerNight),
      amenities: amenities || 'wifi,jacuzzi',
      description: description || '',
      image: image || '/placeholder-hotel.jpg',
      status: status || 'active',
    },
  });

  return NextResponse.json({ data: hotel }, { status: 201 });
}
