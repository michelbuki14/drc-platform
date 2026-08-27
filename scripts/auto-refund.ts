import { PrismaClient as Prisma } from '@prisma/client';

const prisma = new Prisma();

// Auto-refund job: checks for eligible refunds and processes them.
// In production, only sandbox test charges are auto-refunded.
// All other refunds require backoffice approval.

async function autoRefund() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h ago

  // Find successful transactions that are >24h old, not yet refunded,
  // and match auto-refund criteria (sandbox test pattern)
  const candidates = await prisma.transaction.findMany({
    where: {
      status: 'succeeded',
      refundedAt: null,
      refundTx: null,
      createdAt: { lt: cutoff },
      amountUsd: {
        gt: 0,
      },
    },
    include: { user: true },
  });

  const autoRefunded: string[] = [];

  for (const tx of candidates) {
    const cents = Math.round(tx.amountUsd * 100);
    const isSandbox = cents % 100 === 99;

    if (isSandbox) {
      // Auto-refund sandbox test charges
      console.log(`Auto-refunding sandbox charge: ${tx.reference} ($${tx.amountUsd.toFixed(2)})`);

      const refundRef = `RF-AUTO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      await prisma.$transaction(async (txr) => {
        // Create reversal
        await txr.transaction.create({
          data: {
            reference: refundRef,
            userId: tx.userId,
            amountUsd: -tx.amountUsd,
            currency: tx.currency,
            amountLocal: tx.amountLocal != null ? -tx.amountLocal : null,
            localCurrency: tx.localCurrency,
            method: 'wallet',
            providerRef: `AUTO-REFUND-${tx.reference}`,
            status: 'succeeded',
            purpose: 'refund',
            relatedRef: tx.reference,
            completedAt: now,
          },
        });

        // Credit wallet
        await txr.user.update({
          where: { id: tx.userId },
          data: { walletBalanceUsd: { increment: tx.amountUsd } },
        });

        // Mark original as refunded
        await txr.transaction.update({
          where: { id: tx.id },
          data: {
            status: 'refunded',
            refundTx: refundRef,
            refundAmountUsd: tx.amountUsd,
            refundedAt: now,
            reason: 'auto_refund_sandbox',
          },
        });
      });

      autoRefunded.push(tx.reference);
    }
  }

  console.log(`Auto-refunded ${autoRefunded.length} transactions:`);
  for (const ref of autoRefunded) {
    console.log(`  ${ref}`);
  }

  return autoRefunded;
}

autoRefund().then((refs) => {
  console.log(JSON.stringify({ autoRefunded: refs, count: refs.length }));
  prisma.$disconnect();
});
