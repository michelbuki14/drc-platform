import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city')?.toLowerCase();
  const category = searchParams.get('category'); // car, suv, van, truck
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const status = searchParams.get('status') || 'available';

  const where: any = { status };
  if (city) where.location = { contains: city, mode: 'insensitive' };
  if (category) where.category = category.toLowerCase();
  if (minPrice) where.dailyRateUsd = { gte: parseFloat(minPrice) };
  if (maxPrice) where.dailyRateUsd = { ...where.dailyRateUsd, lte: parseFloat(maxPrice) };

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { dailyRateUsd: 'asc' },
  });

  return NextResponse.json({ data: vehicles });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, brand, model, category, transmission, fuel, luggageSlots, seats, dailyRateUsd, image, location, licensePlate, status } = body ?? {};
  if (!name || !dailyRateUsd) {
    return NextResponse.json({ error: 'name, dailyRateUsd required' }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      name,
      brand: brand || '',
      model: model || '',
      category: category || 'car',
      transmission: transmission || 'auto',
      fuel: fuel || 'gasoline',
      luggageSlots: luggageSlots || 2,
      seats: seats || 5,
      dailyRateUsd: Number(dailyRateUsd),
      image: image || '/placeholder-vehicle.jpg',
      location: location || 'Kinshasa',
      licensePlate: licensePlate || null,
      status: status || 'available',
    },
  });

  return NextResponse.json({ data: vehicle }, { status: 201 });
}
