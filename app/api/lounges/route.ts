import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const LOUNGES = [
  { id: 'l1', airportId: 'FIH', name: 'Ndilisongo Lounge', location: 'Terminal 1, Departures Level', access: 'business', priceUsd: 15, amenities: 'WiFi, snacks, showers, work stations' },
  { id: 'l2', airportId: 'FIH', name: 'SkyPass Lounge', location: 'Terminal 2, Pre-security', access: 'all', priceUsd: 25, amenities: 'WiFi, bar, TV, dining area' },
  { id: 'l3', airportId: 'LUB', name: 'Kalambo Lounge', location: 'Departures Hall', access: 'business', priceUsd: 12, amenities: 'WiFi, coffee, charging stations' },
  { id: 'l4', airportId: 'GOM', name: 'Virunga Lounge', location: 'Main terminal', access: 'all', priceUsd: 10, amenities: 'WiFi, water, seating' },
];

export async function GET(req: NextRequest) {
  const airportId = req.nextUrl.searchParams.get('airportId');
  if (airportId) {
    const lounges = LOUNGES.filter((l) => l.airportId === airportId);
    return NextResponse.json({ data: lounges });
  }

  return NextResponse.json({ data: LOUNGES });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, loungeId, flightNo, date, guests } = body ?? {};
  if (!email || !loungeId || !flightNo || !date) {
    return NextResponse.json({ error: 'email, loungeId, flightNo, date required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const lounge = LOUNGES.find((l) => l.id === loungeId);
  if (!lounge) return NextResponse.json({ error: 'Lounge not found' }, { status: 404 });

  const g = parseInt(guests as string, 10) || 1;
  const totalUsd = lounge.priceUsd * g;

  const booking = await prisma.loungeBooking.create({
    data: {
      userId: user.id,
      loungeId,
      flightNo,
      date: new Date(date),
      guests: g,
      totalUsd,
      status: 'confirmed',
    },
  });

  return NextResponse.json({ data: booking }, { status: 201 });
}
