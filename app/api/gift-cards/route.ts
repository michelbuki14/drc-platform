import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Gift cards: list + purchase + send
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;

  const cards = await prisma.giftCard.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const totalValue = cards.filter(c => c.status === 'active').reduce((s, c) => s + c.amountUsd, 0);

  return NextResponse.json({ data: cards, totalValueUsd: totalValue });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { userId, amountUsd, currency, status, recipientEmail, message, sendToSelf } = body ?? {};

  if (!amountUsd) {
    return NextResponse.json({ error: 'amountUsd required' }, { status: 400 });
  }

  const code = 'GC-' + Math.random().toString(36).slice(2, 10).toUpperCase();

  const card = await prisma.giftCard.create({
    data: {
      code,
      userId: (requireUser(req) as any).userId,
      amountUsd: Number(amountUsd),
      currency: currency || 'USD',
      status: status || (sendToSelf ? 'active' : 'sent'),
      recipientEmail: recipientEmail || null,
      message: message || null,
    },
  });

  return NextResponse.json({ data: card }, { status: 201 });
}
