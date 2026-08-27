import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city')?.toLowerCase();
  const category = searchParams.get('category');
  const status = searchParams.get('status') || 'open';

  const where: any = { status };
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (category) where.category = category.toLowerCase();

  const attractions = await prisma.attraction.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ data: attractions });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, city, country, description, category, latitude, longitude, image, entryFeeUsd, address, openingHours, status } = body ?? {};
  if (!name || !city) {
    return NextResponse.json({ error: 'name, city required' }, { status: 400 });
  }

  const attraction = await prisma.attraction.create({
    data: {
      name,
      city,
      country: country || 'CD',
      description: description || '',
      category: category || 'sightseeing',
      latitude: latitude || null,
      longitude: longitude || null,
      image: image || '/placeholder-attraction.jpg',
      entryFeeUsd: entryFeeUsd || 0,
      address: address || null,
      openingHours: openingHours || null,
      status: status || 'open',
    },
  });

  return NextResponse.json({ data: attraction }, { status: 201 });
}
