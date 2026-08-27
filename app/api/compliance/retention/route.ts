import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { retentionDays = 365, dryRun = false } = body ?? {};

  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const oldTransactions = await prisma.transaction.findMany({
    where: {
      createdAt: { lt: cutoffDate },
      status: { in: ['succeeded', 'refunded', 'failed'] },
    },
    select: { id: true },
  });

  if (!dryRun && oldTransactions.length > 0) {
    await prisma.transaction.updateMany({
      where: { id: { in: oldTransactions.map(t => t.id) } },
      data: {
        providerRef: null,
        relatedRef: null,
        reason: null,
      },
    });
  }

  return NextResponse.json({
    data: {
      retentionDays,
      cutoffDate,
      recordsAffected: oldTransactions.length,
      dryRun,
      executed: !dryRun,
      completedAt: new Date().toISOString(),
    },
  });
}
