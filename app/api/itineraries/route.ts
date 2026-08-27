import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;
  const id = searchParams.get('id');

  if (id) {
    const itin = await prisma.itinerary.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!itin) return NextResponse.json({ data: null }, { status: 404 });
    return NextResponse.json({ data: itin });
  }

  const itineraries = await prisma.itinerary.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: { orderBy: { order: 'asc' }, take: 8 } },
  });

  return NextResponse.json({ data: itineraries });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { userId, title, description, isPublic, shareCode } = body ?? {};

  if (!userId || !title) {
    return NextResponse.json({ error: 'userId and title required' }, { status: 400 });
  }

  const itinerary = await prisma.itinerary.create({
    data: {
      userId: (requireUser(req) as any).userId,
      title,
      description: description || null,
      isPublic: isPublic || false,
      shareCode: shareCode || ('ITIN-' + Math.random().toString(36).slice(2, 8).toUpperCase()),
    },
  });

  return NextResponse.json({ data: itinerary }, { status: 201 });
}
