import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/payments - Get the authenticated user's payment history
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ data: payments, total: payments.length });
}

// POST /api/payments - Create a payment (auth required)
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const { amount, currency = 'USD', method, description, metadata } = body;

  if (!amount || !method) {
    return NextResponse.json({ error: 'amount, method required' }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: session.userId,
      amount,
      currency,
      method,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
      status: 'pending',
      reference: 'PAY-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    },
  });

  return NextResponse.json({ data: payment }, { status: 201 });
}
