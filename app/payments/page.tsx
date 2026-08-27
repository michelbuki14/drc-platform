'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

const METHODS = [
  { kind: 'mpesa', label: 'M-Pesa', icon: '📱' },
  { kind: 'airtel_money', label: 'Airtel Money', icon: '💳' },
  { kind: 'orange_money', label: 'Orange Money', icon: '🟠' },
  { kind: 'card', label: 'Card (Visa/Mastercard)', icon: '💳' },
  { kind: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { kind: 'wallet', label: 'CongoConnect Wallet', icon: '👛' },
];

export default function PaymentsPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [amount, setAmount] = useState(50);
  const [method, setMethod] = useState('wallet');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const loadHistory = async () => {
    const r = await fetch('/api/payments');
    if (r.ok) {
      const d = await r.json();
      setHistory(d.data || []);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory().finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const pay = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUsd: amount, method }),
      });
      const d = await r.json();
      if (r.ok) {
        setMsg(`✓ ${method === 'wallet' ? 'Paid' : 'Initiated'} $${amount} via ${method} (${d.data.status})`);
        await loadHistory();
      } else if (r.status === 501) {
        setMsg(`⚠ ${d.error}`);
      } else {
        setMsg(`✗ ${d.error || 'Payment failed'}`);
      }
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center"><p>Loading…</p></div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Sign in to manage payments</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Your payment history and methods are tied to your account.</p>
        <Link href="/account" className="btn-primary mt-4 inline-block px-6 py-2">Go to Account</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[var(--max-width-content)] items-center justify-between px-4 py-3">
          <Link href="/account" className="btn-ghost text-xs">← Account</Link>
          <h1 className="text-sm font-semibold text-[var(--color-text)]">Payments</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-20">
        <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Make a Payment</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Amount (USD)</label>
              <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="input mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className="input mt-1">
                {METHODS.map(m => <option key={m.kind} value={m.kind}>{m.icon} {m.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={pay} disabled={busy || amount <= 0} className="btn-primary mt-3 px-6 disabled:opacity-50">
            {busy ? 'Processing…' : `Pay $${amount}`}
          </button>
          {msg && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{msg}</p>}
        </section>

        <h2 className="mb-3 mt-6 text-sm font-semibold text-[var(--color-text)]">Payment History</h2>
        {loading ? (
          <div className="animate-pulse h-24 rounded-xl bg-[var(--color-surface)]" />
        ) : history.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">${p.amount} · {p.method}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'succeeded' ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
