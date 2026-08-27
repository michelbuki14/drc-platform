import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ data: null }, { status: 404 });

  const bookings = await prisma.vehicleBooking.findMany({
    where: { vehicleId: id },
    orderBy: { pickupDate: 'desc' },
    take: 20,
  });

  return NextResponse.json({ data: { ...vehicle, bookings } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { vehicleId, userId, pickupCity, pickupDate, pickupTime, dropoffCity, dropoffDate, dropoffTime, driverName, driverLicenseNo, guests, totalUsd, status } = body ?? {};
  if (!vehicleId || !userId || !pickupCity || !pickupDate || !driverName || !driverLicenseNo || !totalUsd) {
    return NextResponse.json({ error: 'vehicleId, userId, pickupCity, pickupDate, driverName, driverLicenseNo, totalUsd required' }, { status: 400 });
  }

  // Generate a unique reference for the booking
  const reference = `VEH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const booking = await prisma.vehicleBooking.create({
    data: {
      reference,
      vehicleId,
      userId: userId as string,
      pickupCity: pickupCity as string,
      pickupDate: new Date(pickupDate),
      pickupTime: pickupTime || null,
      dropoffCity: dropoffCity ?? null,
      dropoffDate: dropoffDate ? new Date(dropoffDate) : null,
      dropoffTime: dropoffTime ?? null,
      driverName: driverName as string,
      driverLicenseNo: driverLicenseNo as string,
      guests: guests ?? 1,
      totalUsd: Number(totalUsd),
      status: 'confirmed' as string,
    },
  });

  return NextResponse.json({ data: booking }, { status: 201 });
}