import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomBytes } from '@/lib/crypto';

/* ────────────────────────────────────────────────────────────
   CongoConnect Refund API
   POST /api/payments/refund
     body: { txRef, amountUsd?, reason, customerEmail }
   Returns refund transaction details + wallet credit.
   ──────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { txRef: txRefParam, amountUsd: requestedAmount, reason, customerEmail } = body ?? {};

  if (!txRefParam) {
    return NextResponse.json({ error: 'txRef is required' }, { status: 400 });
  }

  // Resolve original transaction (include user for audit trail)
  const tx = await prisma.transaction.findUnique({
    where: { reference: txRefParam },
    include: { user: true },
  });
  if (!tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  // Validate refund eligibility
  if (tx.status !== 'succeeded') {
    return NextResponse.json({
      error: `Cannot refund: transaction status is "${tx.status}" (must be "succeeded")`,
    }, { status: 422 });
  }
  if (tx.refundTx) {
    return NextResponse.json({ error: 'Transaction already refunded' }, { status: 409 });
  }

  // Amount: default to full refund if not specified or > original
  const refundAmount = (requestedAmount != null && requestedAmount > 0 && requestedAmount <= tx.amountUsd)
    ? requestedAmount
    : tx.amountUsd;

  if (requestedAmount != null && requestedAmount > tx.amountUsd) {
    return NextResponse.json({
      error: `Refund amount ($${requestedAmount}) exceeds original charge ($${tx.amountUsd})`,
    }, { status: 422 });
  }

  const isLocalMoney = ['mpesa', 'airtel_money', 'orange_money'].includes(tx.method);
  const refundCdf = isLocalMoney ? Math.round(refundAmount * 2850) : null;

  // Refund reference
  const refundRef = `RF-${randomBytes(3).toString('hex').toUpperCase()}${Date.now() % 10000}`;

  // 1. Create reversal transaction (negative debit)
  const reversal = await prisma.transaction.create({
    data: {
      reference: refundRef,
      userId: tx.userId,
      amountUsd: -refundAmount,
      currency: tx.currency,
      amountLocal: refundCdf != null ? -refundCdf : null,
      localCurrency: tx.localCurrency,
      method: 'wallet',
      providerRef: `REFUND-${txRefParam}`,
      status: 'succeeded',
      purpose: 'refund',
      relatedRef: txRefParam,
      completedAt: new Date(),
    },
  });

  // 2. Credit wallet back
  await prisma.user.update({
    where: { id: tx.userId },
    data: { walletBalanceUsd: { increment: refundAmount } },
  });

  // 3. Mark original tx as refunded
  const refundedTx = await prisma.transaction.update({
    where: { id: tx.id },
    data: {
      status: 'refunded',
      refundTx: refundRef,
      refundAmountUsd: refundAmount,
      refundedAt: new Date(),
      reason: reason ?? 'customer_request',
    },
  });

  // 4. Audit trail
  const actorEmail = customerEmail ?? tx.user.email;
  await prisma.auditLog.create({
    data: {
      actor: actorEmail,
      actorRole: 'traveler',
      action: 'payment_refunded',
      target: txRefParam,
      detail: JSON.stringify({
        refundReference: refundRef,
        originalReference: txRefParam,
        amountUsd: refundAmount,
        originalAmountUsd: tx.amountUsd,
        method: tx.method,
        reason: reason ?? 'customer_request',
      }),
      createdAt: new Date(),
    },
  });

  return NextResponse.json({
    data: {
      refundReference: refundRef,
      originalReference: txRefParam,
      refundAmountUsd: refundAmount,
      refundAmountCdf: refundCdf,
      originalAmountUsd: tx.amountUsd,
      newWalletBalance: (await prisma.user.findUnique({ where: { id: tx.userId } }))?.walletBalanceUsd,
      status: 'succeeded',
      reason: reason ?? 'customer_request',
      createdAt: new Date().toISOString(),
    },
  });
}

/** GET: look up refund by reference */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) return NextResponse.json({ error: 'ref is required' }, { status: 400 });

  const refundTx = await prisma.transaction.findUnique({
    where: { reference: ref, purpose: 'refund' },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });

  if (!refundTx) {
    return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
  }

  return NextResponse.json({ data: refundTx });
}
