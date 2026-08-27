import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email } = body ?? {};

  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const booking = await prisma.booking.findMany({ where: { email: email.toLowerCase() } });
  const tickets = await prisma.ticket.findMany({ where: { booking: { email: email.toLowerCase() } } });
  const transactions = await prisma.transaction.findMany({ where: { userId: user.id } });
  const consents = await prisma.clinicalData.findMany({ where: { userId: user.id } });

  return NextResponse.json({
    data: {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        nationality: user.nationality,
        createdAt: user.createdAt,
      },
      bookings: booking,
      tickets,
      transactions,
      consents,
      exportedAt: new Date().toISOString(),
    },
  });
}
