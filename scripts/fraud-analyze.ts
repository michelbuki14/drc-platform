import { PrismaClient as Prisma } from '@prisma/client';

const prisma = new Prisma();

// Anti-fraud analyser
async function analyzeFraud(sinceHours = 168) {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

  // Get all recent successful transactions
  const TR = await prisma.transaction.findMany({
    where: {
      status: 'succeeded',
      createdAt: { gte: since },
    },
    include: {
      user: { select: { email: true, walletBalanceUsd: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const flags: Array<{txRef: string; userEmail: string; amountUsd: number; reason: string; severity: string}> = [];

  // Rapid succession
  for (let i = 0; i < TR.length; i++) {
    const tr = TR[i];
    for (let j = i + 1; j < TR.length; j++) {
      const other = TR[j];
      if (tr.userId === other.userId) {
        const diff = Math.abs(new Date(tr.createdAt).getTime() - new Date(other.createdAt).getTime());
        if (diff < 5 * 60 * 1000) {
          flags.push({txRef: tr.reference, userEmail: tr.user.email, amountUsd: tr.amountUsd, reason: `Rapid succession: ${Math.round(diff/1000)}s after another charge`, severity: 'high'});
          break;
        }
      }
    }
  }

  // High CDF mobile money
  const highCdf = TR.filter(t => ['mpesa','airtel_money','orange_money'].includes(t.method) && t.amountLocal != null && t.amountLocal > 5000 * 2850);
  for (const t of highCdf) {
    flags.push({txRef: t.reference, userEmail: t.user.email, amountUsd: t.amountUsd, reason: `High CDF mobile money charge: $${t.amountUsd.toFixed(2)} USD (${t.amountLocal} CDF)`, severity: 'medium'});
  }

  // Sandbox test pattern (.99)
  const sandboxTest = TR.filter(t => Math.round(t.amountUsd * 100) % 100 === 99);
  for (const t of sandboxTest) {
    flags.push({txRef: t.reference, userEmail: t.user.email, amountUsd: t.amountUsd, reason: `Sandbox test pattern: amount ends in .99 ($${t.amountUsd.toFixed(2)})`, severity: 'low'});
  }

  // Wallet balance anomalies
  const walletAnomalies = TR.filter(t => t.user.walletBalanceUsd > 100000 && t.amountUsd > 100);
  for (const t of walletAnomalies) {
    flags.push({txRef: t.reference, userEmail: t.user.email, amountUsd: t.amountUsd, reason: `Wallet balance anomaly: $${t.user.walletBalanceUsd.toFixed(2)} balance + $${t.amountUsd.toFixed(2)} charge`, severity: 'medium'});
  }

  console.log('=== FRAUD ANALYSIS REPORT ===');
  console.log(`Period: ${sinceHours} hours`);
  console.log(`Total transactions: ${TR.length}`);
  console.log(`Flags: ${flags.length}`);
  if (flags.length === 0) {
    console.log('No suspicious patterns.');
  } else {
    for (const f of flags) {
      console.log(`  [${f.severity.toUpperCase()}] ${f.txRef} | ${f.userEmail} | $${f.amountUsd.toFixed(2)} | ${f.reason}`);
    }
  }

  // Auto-refund check (sandbox charges > 24h old)
  console.log('');
  console.log('=== AUTO-REFUND CHECK ===');
  const autoRefundCandidates = TR.filter(t => {
    const cents = Math.round(t.amountUsd * 100);
    const isSandbox = cents % 100 === 99;
    const isOld = new Date(t.createdAt).getTime() < Date.now() - 24 * 60 * 60 * 1000;
    return isSandbox && isOld && !t.refundTx;
  });
  console.log(`Sandbox charges eligible for auto-refund: ${autoRefundCandidates.length}`);

  return {flags, autoRefundCount: autoRefundCandidates.length};
}

const result = await analyzeFraud(168);
console.log(JSON.stringify(result, null, 2));
