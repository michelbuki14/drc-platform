import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

// GET /api/airport/car-rentals?airportId=apt_fih  (list) | ?userId=usr_test001 (my bookings)
// POST /api/airport/car-rentals — reserve a car
export async function GET(req: NextRequest) {
  const airportId = req.nextUrl.searchParams.get('airportId');
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;
  if (userId) {
    const bookings = await prisma.airportCarRentalBooking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ data: bookings });
  }
  const where = airportId ? { airportId } : {};
  const rentals = await prisma.airportCarRental.findMany({ where, orderBy: { dailyRateUsd: 'asc' } });
  return NextResponse.json({ data: rentals });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { rentalId, pickupAt, returnAt, flightNo } = body ?? {};
  if (!rentalId || !pickupAt || !returnAt) {
    return NextResponse.json({ error: 'rentalId, pickupAt, returnAt required' }, { status: 400 });
  }
  const userId = (requireUser(req) as any).userId;
  const rental = await prisma.airportCarRental.findUnique({ where: { id: rentalId } });
  if (!rental) return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
  const days = Math.max(1, Math.ceil((new Date(returnAt).getTime() - new Date(pickupAt).getTime()) / 86400000));
  const total = rental.dailyRateUsd * days;
  const booking = await prisma.airportCarRentalBooking.create({
    data: {
      userId,
      rentalId,
      pickupAt: new Date(pickupAt),
      returnAt: new Date(returnAt),
      flightNo: flightNo || null,
      status: 'reserved',
      totalUsd: total,
    },
  });
  return NextResponse.json({ data: booking }, { status: 201 });
}
