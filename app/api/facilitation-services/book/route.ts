import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

// Book a facilitator service
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => ({}));
  const { facilitationServiceId, date, time, notes, guests } = body;
  
  if (!facilitationServiceId || !date) {
    return NextResponse.json({ error: 'facilitationServiceId, date required' }, { status: 400 });
  }
  
  const booking = await prisma.facilitationServiceBooking.create({
    data: {
      facilitationServiceId,
      userId: session.userId,
      date: new Date(date),
      time: time || null,
      guests: guests || 1,
      notes: notes || null,
      status: 'pending',
    },
  });
  
  return NextResponse.json({ booking }, { status: 201 });
}
