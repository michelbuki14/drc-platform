import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, amountUsd } = body ?? {};

  if (!email || !amountUsd || amountUsd <= 0) {
    return NextResponse.json({ error: 'email and positive amountUsd required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const newBalance = user.walletBalanceUsd + amountUsd;

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { walletBalanceUsd: newBalance },
    }),
    prisma.walletTransaction.create({
      data: {
        userId: user.id,
        amountUsd,
        direction: 'credit',
        type: 'deposit',
        balanceAfter: newBalance,
        description: `Wallet deposit of $${amountUsd.toFixed(2)}`,
      },
    }),
  ]);

  return NextResponse.json({
    data: { balance: updated.walletBalanceUsd, deposited: amountUsd },
  });
}
