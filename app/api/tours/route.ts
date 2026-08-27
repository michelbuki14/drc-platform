import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city')?.toLowerCase();
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const where: any = {};
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (category) where.category = category.toLowerCase();
  if (minPrice) where.perPersonUsd = { gte: parseFloat(minPrice) };
  if (maxPrice) where.perPersonUsd = { ...where.perPersonUsd, lte: parseFloat(maxPrice) };

  const tours = await prisma.tour.findMany({
    where,
    orderBy: { perPersonUsd: 'asc' },
  });

  return NextResponse.json({ data: tours });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, city, country, description, durationHours, category, language, includes, meetingPoint, maxGuests, perPersonUsd, image, status } = body ?? {};
  if (!name || !city || !perPersonUsd) {
    return NextResponse.json({ error: 'name, city, perPersonUsd required' }, { status: 400 });
  }

  const tour = await prisma.tour.create({
    data: {
      name,
      city,
      country: country || 'CD',
      description: description || '',
      durationHours: durationHours || 3,
      category: category || 'guided',
      language: language || 'en',
      includes: includes || 'guide,transport',
      meetingPoint: meetingPoint || null,
      maxGuests: maxGuests || 10,
      perPersonUsd: Number(perPersonUsd),
      image: image || '/placeholder-tour.jpg',
      status: status || 'available',
    },
  });

  return NextResponse.json({ data: tour }, { status: 201 });
}
