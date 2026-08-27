import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');

  if (id) {
    const deal = await prisma.packageDeal.findUnique({ where: { id } });
    if (!deal) return NextResponse.json({ data: null }, { status: 404 });

    const bookings = await prisma.packageBooking.findMany({
      where: { dealId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: { ...deal, bookings } });
  }

  const deals = await prisma.packageDeal.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: deals });
}
