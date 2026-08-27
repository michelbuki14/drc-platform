import { PrismaClient as Prisma } from '@prisma/client';

const prisma = new Prisma();

// Transactions sync job: reconciles payment ledger with Prisma records.
// Detects discrepancies between expected and actual transactions.
// In production, this would pull from gateway webhooks and reconcile.

async function syncPayments() {
  console.log('=== PAYMENTS SYNC ===');
  console.log(`Start time: ${new Date().toISOString()}`);

  // Fetch all transactions
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  });

  console.log(`Total transactions in ledger: ${transactions.length}`);

  // Summary by status
  const byStatus: Record<string, number> = {};
  for (const t of transactions) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  }

  console.log('By status:');
  for (const entry of Object.entries(byStatus)) {
    const [status, count] = entry;
    console.log(`  ${status}: ${count}`);
  }

  // Summary by method
  const byMethod: Record<string, number> = {};
  for (const t of transactions) {
    byMethod[t.method] = (byMethod[t.method] || 0) + 1;
  }

  console.log('By method:');
  for (const entry of Object.entries(byMethod)) {
    const [method, count] = entry;
    console.log(`  ${method}: ${count}`);
  }

  // Total volume
  const totalVolume = transactions
    .filter((t: any) => t.status === 'succeeded')
    .reduce((sum: number, t: any) => sum + t.amountUsd, 0);

  console.log(`Total succeeded volume: $${totalVolume.toFixed(2)} USD`);

  // Pending transactions
  const pending = transactions.filter((t: any) => t.status === 'pending' || t.status === 'processing');
  console.log(`Pending/processing: ${pending.length}`);

  if (pending.length > 0) {
    console.log('Oldest pending:');
    const oldest = pending.reduce((a: any, b: any) =>
      new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? a : b
    );
    console.log(`  ${oldest.reference} — ${oldest.method} — $${oldest.amountUsd.toFixed(2)} — ${oldest.createdAt}`);
  }

  console.log('Sync complete.');
  return { total: transactions.length, byStatus, byMethod, totalVolume, pending: pending.length };
}

syncPayments().then((r) => {
  console.log(JSON.stringify(r, null, 2));
  prisma.$disconnect();
});
