import { prisma } from "@/lib/db";
import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => null);
  const { amountUsd, partnerId } = body ?? {};

  if (!amountUsd || amountUsd <= 0) {
    return NextResponse.json({ error: 'positive amountUsd required' }, { status: 400 });
  }

  // Partner withdrawal (partner must own partnerId via session user email)
  if (partnerId) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    if (partner.contactEmail.toLowerCase() !== user?.email.toLowerCase()) {
      return NextResponse.json({ error: 'You do not own this partner account' }, { status: 403 });
    }
    if (partner.balanceUsd < amountUsd) {
      return NextResponse.json({ error: 'Insufficient partner balance' }, { status: 402 });
    }
    const newBalance = partner.balanceUsd - amountUsd;
    const updated = await prisma.partner.update({ where: { id: partnerId }, data: { balanceUsd: newBalance } });
    return NextResponse.json({ data: { balance: updated.balanceUsd, withdrawn: amountUsd } });
  }

  // User withdrawal
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.walletBalanceUsd < amountUsd) {
    return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 402 });
  }

  const newBalance = user.walletBalanceUsd - amountUsd;
  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { walletBalanceUsd: newBalance },
    }),
    prisma.walletTransaction.create({
      data: {
        userId: user.id,
        amountUsd: -amountUsd,
        direction: 'debit',
        type: 'withdraw',
        balanceAfter: newBalance,
        description: `Withdrawal of $${amountUsd.toFixed(2)}`,
      },
    }),
  ]);

  return NextResponse.json({
    data: { balance: updated.walletBalanceUsd, withdrawn: amountUsd },
  });
}
