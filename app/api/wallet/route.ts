import { prisma } from "@/lib/db";
import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const txs = await prisma.walletTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    data: {
      balance: user.walletBalanceUsd,
      transactions: txs,
    },
  });
}
