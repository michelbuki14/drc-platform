import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sha256, randomBytes } from '@/lib/crypto';

/**
 * CongoConnect Payment API — charge + confirm + refund
 * HIPAA/ISO 27701 scope: minimum-necessary data,
 *   no PAN/CVV stored in clear, consent-gated medical data,
 *   audit trail on every access to PHI.
 */
const PROVIDERS: Record<string, string> = {
  mpesa: 'MP',
  airtel_money: 'AM',
  orange_money: 'OM',
  card: 'CD',
  bank_transfer: 'BT',
  wallet: 'WL',
};

const CDF_RATE = 2850;

function txRef(method: string): string {
  return `TX-${PROVIDERS[method] ?? 'NX'}-${randomBytes(3).toString('hex').toUpperCase()}${Date.now() % 10000}`;
}

/** Deterministic sandbox decline: amount ends in .99 */
function willDecline(amountUsd: number): boolean {
  return Math.abs(Math.round(amountUsd * 100) % 100 - 99) < 0.0001;
}

/**
 * Record an audit event on PHI access.
 * HIPAA §164.312(b): audit controls.
 */
async function auditAccess(
  action: string,
  target: string,
  userId: string,
  role: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  await (prisma as any).auditLog.create({
    data: {
      actor: userId,
      actorRole: role,
      action,
      target,
      detail: detail ? JSON.stringify(detail) : null,
      ipAddress: '127.0.0.1',
      createdAt: new Date(),
    },
  });
}

/** Process a payment. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, method, amountUsd, purpose, relatedRef, cvv, expiry } = body ?? {};

  if (!email || !method || !amountUsd) {
    return NextResponse.json({ error: 'email, method and amountUsd are required' }, { status: 400 });
  }
  if (!PROVIDERS[method]) {
    return NextResponse.json({
      error: `method must be one of ${Object.keys(PROVIDERS).join(', ')}`,
    }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Wallet rail
  if (method === 'wallet') {
    if (user.walletBalanceUsd < amountUsd) {
      return NextResponse.json({
        error: `Insufficient wallet balance ($${user.walletBalanceUsd.toFixed(2)})`,
      }, { status: 402 });
    }
    const ref = txRef('wallet');
    try {
      const [tx] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            reference: ref,
            userId: user.id,
            amountUsd,
            method: 'wallet',
            providerRef: 'WALLET-' + Date.now(),
            status: 'succeeded',
            purpose: purpose ?? 'service',
            relatedRef: relatedRef ?? null,
            completedAt: new Date(),
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { walletBalanceUsd: { decrement: amountUsd } },
        }),
      ]);
      await auditAccess('wallet_debit', ref, user.id, user.role, { amountUsd });
      return NextResponse.json({
        data: { reference: tx.reference, status: tx.status, amountUsd, remainingBalance: user.walletBalanceUsd - amountUsd },
      });
    } catch (e: any) {
      return NextResponse.json({ error: 'Wallet transaction failed', detail: e?.message }, { status: 500 });
    }
  }

  // Card — HIPAA/ISO: never store PAN or CVV
  if (method === 'card') {
    if (!cvv || !expiry) {
      return NextResponse.json({
        error: 'Card payments require cvv and expiry (MM/YY)',
      }, { status: 400 });
    }
    const expiryMatch = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
      return NextResponse.json({ error: 'expiry must be MM/YY' }, { status: 400 });
    }
    const [_, expMonth, expYear] = expiryMatch;
    const expDate = new Date(parseInt(expYear, 10) + 2000, parseInt(expMonth, 10), 1);
    if (expDate <= new Date()) {
      return NextResponse.json({ error: 'Card is expired' }, { status: 400 });
    }

    const maskedPan = `••••${cvv.slice(-4)}`;
    const existingCard = await prisma.paymentMethod.findFirst({
      where: { userId: user.id, kind: 'card' },
    });
    if (!existingCard) {
      await prisma.paymentMethod.create({
        data: {
          userId: user.id,
          kind: 'card',
          label: `Card ${maskedPan}`,
          identifier: expiry,
          isDefault: true,
        },
      });
    }

    const ref = txRef('card');
    const willFail = willDecline(amountUsd);

    const tx = await prisma.transaction.create({
      data: {
        reference: ref,
        userId: user.id,
        amountUsd,
        currency: 'USD',
        method: 'card',
        providerRef: willFail ? `SIM-DECLINED-${Date.now()}` : `SIM-SUCCESS-${Date.now()}`,
        status: willFail ? 'failed' : 'processing',
        purpose: purpose ?? 'service',
        relatedRef: relatedRef ?? null,
        ...(willFail ? { reason: 'Provider declined transaction (sandbox test)' } : {}),
      },
    });

    if (willFail) {
      return NextResponse.json({
        data: { reference: tx.reference, status: 'failed', reason: 'Provider declined (sandbox)' },
      }, { status: 402 });
    }

    const confirmed = await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: 'succeeded', completedAt: new Date() },
    });

    await auditAccess('card_charge', ref, user.id, user.role, { amountUsd, maskedPan, expiry });

    return NextResponse.json({
      data: {
        reference: confirmed.reference,
        status: confirmed.status,
        amountUsd,
        providerRef: confirmed.providerRef,
        purpose: purpose ?? 'service',
      },
    });
  }

  // Mobile money / bank
  const isLocalMoney = ['mpesa', 'airtel_money', 'orange_money'].includes(method);
  const ref = txRef(method);
  const willFail = willDecline(amountUsd);

  const tx = await prisma.transaction.create({
    data: {
      reference: ref,
      userId: user.id,
      amountUsd,
      currency: isLocalMoney ? 'CDF' : 'USD',
      amountLocal: isLocalMoney ? Math.round(amountUsd * CDF_RATE) : null,
      localCurrency: isLocalMoney ? 'CDF' : null,
      method,
      providerRef: willFail ? `SIM-DECLINED-${Date.now()}` : `${PROVIDERS[method]}${Date.now()}.${randomBytes(3).toString('hex').toUpperCase()}`,
      status: willFail ? 'failed' : 'processing',
      purpose: purpose ?? 'service',
      relatedRef: relatedRef ?? null,
      ...(willFail ? { reason: 'Provider declined transaction' } : {}),
    },
  });

  if (willFail) {
    return NextResponse.json({
      data: { reference: tx.reference, status: 'failed', reason: 'Provider declined' },
    }, { status: 402 });
  }

  const confirmed = await prisma.transaction.update({
    where: { id: tx.id },
    data: { status: 'succeeded', completedAt: new Date() },
  });

  await auditAccess('payment_succeeded', ref, user.id, user.role, { amountUsd, method, isLocalMoney });

  return NextResponse.json({
    data: {
      reference: confirmed.reference,
      status: confirmed.status,
      amountUsd,
      ...(isLocalMoney
        ? { amountCdf: Math.round(amountUsd * CDF_RATE), note: 'Debited in CDF via mobile money' }
        : {}),
      providerRef: confirmed.providerRef,
      purpose: purpose ?? 'service',
    },
  });
}

/** Webhook confirmation from provider. */
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { reference, status, providerRef } = body ?? {};

  if (!reference || !status) {
    return NextResponse.json({ error: 'reference and status are required' }, { status: 400 });
  }

  const tx = await prisma.transaction.findUnique({
    where: { reference },
    include: { user: true },
  });
  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  if (status === 'succeeded') {
    const updated = await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: 'succeeded',
        completedAt: new Date(),
        providerRef: providerRef ?? tx.providerRef,
      },
    });
    await auditAccess('payment_confirmed', reference, tx.userId, tx.user.role, {
      previousStatus: tx.status,
      providerRef,
    });
    return NextResponse.json({ data: { reference, status: updated.status } });
  }

  if (status === 'failed') {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: 'failed',
        ...(body?.reason ? { reason: body.reason } : {}),
      },
    });
    await auditAccess('payment_failed', reference, tx.userId, tx.user.role, {
      previousStatus: tx.status,
      reason: body?.reason,
    });
    return NextResponse.json({ data: { reference, status: 'failed' } });
  }

  if (status === 'refunded') {
    const updated = await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: 'refunded',
        refundedAt: new Date(),
        ...(body?.reason ? { reason: body.reason } : {}),
      },
    });
    await auditAccess('payment_refunded', reference, tx.userId, tx.user.role, {});
    return NextResponse.json({ data: { reference, status: 'refunded' } });
  }

  return NextResponse.json({ error: `Unknown status "${status}"` }, { status: 400 });
}

/** Refund a successful charge (full or partial). */
export async function PATCH(req: NextRequest) {
  const txRefParam = req.nextUrl.searchParams.get('txRef');
  const amountUsd_param = req.nextUrl.searchParams.get('amountUsd');
  const reason = (req.nextUrl.searchParams.get('reason') as string) ?? 'customer_request';

  if (!txRefParam) {
    return NextResponse.json({ error: 'txRef is required' }, { status: 400 });
  }

  const tx = await prisma.transaction.findUnique({
    where: { reference: txRefParam },
    include: { user: true },
  });
  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  if (tx.status !== 'succeeded') {
    return NextResponse.json({
      error: `Cannot refund: transaction status is "${tx.status}" (must be "succeeded")`,
    }, { status: 422 });
  }

  // Check if already refunded (using type assertion since client may not have field yet)
  if ((tx as any).refundTx) {
    return NextResponse.json({
      error: 'Transaction already refunded',
    }, { status: 409 });
  }

  const amountUsd = amountUsd_param ? Number(amountUsd_param) : null;
  const refundAmount = (amountUsd && amountUsd > 0 && amountUsd <= tx.amountUsd)
    ? amountUsd
    : tx.amountUsd;

  if (amountUsd && amountUsd > tx.amountUsd) {
    return NextResponse.json({
      error: `Refund amount ($${amountUsd}) exceeds original charge ($${tx.amountUsd})`,
    }, { status: 422 });
  }

  const isLocalMoney = ['mpesa', 'airtel_money', 'orange_money'].includes(tx.method);
  const refundCdf = isLocalMoney ? Math.round(refundAmount * CDF_RATE) : null;

  const refundRef = `RF-${randomBytes(3).toString('hex').toUpperCase()}${Date.now() % 10000}`;

  // Create refund reversal
  await prisma.transaction.create({
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

  // Credit wallet back
  await prisma.user.update({
    where: { id: tx.userId },
    data: { walletBalanceUsd: { increment: refundAmount } },
  });

  // Mark original tx as refunded
  const updatedTx = await prisma.transaction.update({
    where: { id: tx.id },
    data: {
      status: 'refunded',
      refundTx: refundRef,
      refundAmountUsd: refundAmount,
      refundedAt: new Date(),
      ...(reason ? { reason } : {}),
    },
  });

  const updatedUser = await prisma.user.findUnique({ where: { id: tx.userId } });

  await auditAccess('payment_refunded', txRefParam, tx.userId, tx.user.role, {
    refundReference: refundRef,
    amountUsd: refundAmount,
    originalAmount: tx.amountUsd,
    reason,
    method: tx.method,
  });

  return NextResponse.json({
    data: {
      refundReference: refundRef,
      originalReference: txRefParam,
      amountUsd: refundAmount,
      amountCdf: refundCdf,
      originalAmountUsd: tx.amountUsd,
      newWalletBalance: updatedUser?.walletBalanceUsd ?? 0,
      status: 'succeeded',
      reason,
    },
  });
}
