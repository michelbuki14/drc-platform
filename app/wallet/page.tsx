'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

interface WalletTx {
  id: string;
  amountUsd: number;
  direction: string;
  type: string;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

export default function WalletPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('test@test.com');
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/wallet?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to load wallet');
      }
      const data = await res.json();
      setBalance(data.data.balance);
      setTxs(data.data.transactions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const deposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setDepositLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amountUsd: amount }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Deposit failed');
      }
      setDepositAmount('');
      fetchWallet();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDepositLoading(false);
    }
  };

  const withdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setWithdrawLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amountUsd: amount }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Withdrawal failed');
      }
      setWithdrawAmount('');
      fetchWallet();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">C</span>
                <span className="text-base font-bold text-[var(--color-primary)]">Congo<span className="text-[var(--color-accent)]">Connect</span></span>
              </Link>
              <span className="h-4 w-px bg-[var(--color-border)] hidden sm:block"/>
              <span className="text-sm text-[var(--color-text-muted)] hidden sm:block">Wallet</span>
            </div>
            <Link href="/" className="btn-ghost text-xs">← Home</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        {error && <div className="mb-4 rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">{error}</div>}

        {/* Balance card */}
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-sm mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Available balance</p>
          <p className="mt-1 text-4xl font-bold text-[var(--color-primary)]">${balance.toFixed(2)}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">USD</p>
        </div>

        {/* Actions */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Deposit funds</h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="100.00"
                className="flex-1 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={deposit}
                disabled={depositLoading}
                className="btn-primary px-4"
              >
                {depositLoading ? '...' : 'Deposit'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Withdraw</h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="50.00"
                className="flex-1 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={withdraw}
                disabled={withdrawLoading}
                className="btn-secondary px-4"
              >
                {withdrawLoading ? '...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Transaction history</h3>
            <button type="button" onClick={fetchWallet} className="text-xs text-[var(--color-primary)] hover:underline">Refresh</button>
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(n => <div key={n} className="animate-pulse rounded-xl bg-[var(--color-bg)] h-12"/>)}</div>
          ) : txs.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {txs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tx.direction === 'credit' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'}`}>
                      {tx.direction === 'credit' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{tx.type}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {tx.description} · {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.amountUsd >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                      {tx.amountUsd >= 0 ? '+' : ''}{tx.amountUsd.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">${tx.balanceAfter.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
