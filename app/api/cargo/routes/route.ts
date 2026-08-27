import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ROUTES = [
  { id: 'cr1', origin: 'FIH', destination: 'LUB', mode: 'air', carrier: 'Congo Airways', durationDays: 1, pricePerKgUsd: 1.50 },
  { id: 'cr2', origin: 'FIH', destination: 'GOM', mode: 'air', carrier: 'CAA Cargo', durationDays: 1, pricePerKgUsd: 2.00 },
  { id: 'cr3', origin: 'LUB', destination: 'GOM', mode: 'air', carrier: 'Friendship Air', durationDays: 1, pricePerKgUsd: 1.80 },
  { id: 'cr4', origin: 'FCB', destination: 'LI5', mode: 'river', carrier: 'Congo River Lines', durationDays: 7, pricePerKgUsd: 0.50 },
  { id: 'cr5', origin: 'LUB', destination: 'Mbuji-Mayi', mode: 'road', carrier: 'TransKasaï Logistics', durationDays: 2, pricePerKgUsd: 0.30 },
];

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('mode');
  if (mode) {
    return NextResponse.json({ data: ROUTES.filter((r) => r.mode === mode) });
  }
  return NextResponse.json({ data: ROUTES });
}
