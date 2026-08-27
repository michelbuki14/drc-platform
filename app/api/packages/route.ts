import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (id) {
      const deal = await prisma.packageDeal.findUnique({ where: { id } });
      if (!deal) return NextResponse.json({ data: null }, { status: 404 });

      const bookings = await prisma.packageBooking.findMany({
        where: { dealId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const totalBookings = await prisma.packageBooking.count({ where: { dealId: id } });

      return NextResponse.json({
        data: {
          ...deal,
          totalBookings,
          recentBookings: bookings,
        },
      });
    }

    const deals = await prisma.packageDeal.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.packageDeal.count({ where: { status: 'active' } });

    return NextResponse.json({ data: deals, total, limit, offset });
  } catch (e) {
    console.error('GET /api/packages error:', e);
    return NextResponse.json({ error: 'Internal server error', details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

    const { dealId, email, passengerName, phone, guests, adults, children, totalUsd, status, notes } = body;

    if (!dealId || !email || !passengerName || !guests || !totalUsd) {
      return NextResponse.json({ error: 'dealId, email, passengerName, guests, totalUsd required' }, { status: 400 });
    }

    const deal = await prisma.packageDeal.findUnique({ where: { id: dealId } });
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    if (deal.status !== 'active') return NextResponse.json({ error: 'Deal not available' }, { status: 400 });
    if (guests < 1 || guests > 10) return NextResponse.json({ error: 'Guests must be 1-10' }, { status: 400 });
    if (adults != null && children != null && adults + children !== guests) {
      return NextResponse.json({ error: 'adults + children must equal guests' }, { status: 400 });
    }

    const ref = 'PKG-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    const booking = await prisma.packageBooking.create({
      data: {
        reference: ref,
        dealId,
        userId: 'usr_test001',
        passengerName,
        email,
        phone: phone ?? null,
        guests,
        adults: adults ?? Math.ceil(guests / 2),
        children: children ?? 0,
        totalUsd: Number(totalUsd),
        status: status ?? 'pending',
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (e) {
    console.error('POST /api/packages error:', e);
    return NextResponse.json({ error: 'Internal server error', details: String(e) }, { status: 500 });
  }
}
