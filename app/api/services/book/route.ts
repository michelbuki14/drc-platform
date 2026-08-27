import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Book a service (generic service entity)
export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const serviceId = searchParams.get('service') ?? (await req.json().catch(() => ({}))).serviceId;
  const body = await req.json().catch(() => ({}));
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;
  const date = body.date;
  const time = body.time;
  const guests = body.guests ?? 1;
  const notes = body.notes;

  if (!serviceId || !date) {
    return NextResponse.json({ error: 'serviceId, date required' }, { status: 400 });
  }

  const booking = await prisma.facilitationServiceBooking.create({
    data: {
      facilitationServiceId: serviceId,
      userId: (requireUser(req) as any).userId,
      date: new Date(date),
      time: time || null,
      guests,
      notes: notes || null,
      status: 'pending',
    },
  });

  return NextResponse.json({ booking }, { status: 201 });
}
