import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'flight';
  const minCoverage = searchParams.get('minCoverage');
  const maxPremium = searchParams.get('maxPremium');

  if (id) {
    const ins = await prisma.insurance.findUnique({ where: { id } });
    if (!ins) return NextResponse.json({ data: null }, { status: 404 });

    const bookings = await prisma.insuranceBooking.findMany({
      where: { insuranceId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: {
        ...ins,
        totalPurchases: bookings.length,
        bookings,
      },
    });
  }

  const where: Record<string, any> = {};
  if (type) where.type = type.toLowerCase();
  if (minCoverage) where.coverageUsd = { gte: Number(minCoverage) };
  if (maxPremium) where.premiumUsd = { lte: Number(maxPremium) };

  const [insurances, total] = await Promise.all([
    prisma.insurance.findMany({
      where,
      orderBy: { premiumUsd: 'asc' },
    }),
    prisma.insurance.count({ where }),
  ]);

  return NextResponse.json({ data: insurances, total, limit: 20 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { insuranceId, email, name, dob, passportNo, destination, tripDate, coverageUsd, premiumUsd, status } = body;

  if (!insuranceId || !email || !name || !coverageUsd || !premiumUsd) {
    return NextResponse.json({ error: 'insuranceId, email, name, coverageUsd, premiumUsd required' }, { status: 400 });
  }

  const ins = await prisma.insurance.findUnique({ where: { id: insuranceId } });
  if (!ins) return NextResponse.json({ error: 'Insurance product not found' }, { status: 404 });
  if ((ins as any).status !== 'active' && ins.status !== 'active') {
    return NextResponse.json({ error: 'Insurance not available' }, { status: 400 });
  }

  const reference = 'POL-' + Math.random().toString(36).slice(2, 10).toUpperCase();

  const booking = await prisma.insuranceBooking.create({
    data: {
      reference,
      insuranceId,
      userId: 'usr_test001',
      name,
      email,
      dob: dob ? new Date(dob) : null,
      passportNo: passportNo ?? null,
      destination: destination ?? null,
      tripDate: tripDate ? new Date(tripDate) : null,
      coverageUsd: Number(coverageUsd),
      premiumUsd: Number(premiumUsd),
      status: status ?? 'purchased',
    },
  });

  return NextResponse.json({ data: booking }, { status: 201 });
}
