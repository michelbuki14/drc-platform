'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

const METHOD_LABELS: Record<string, string> = {
  mpesa:       'M-Pesa',
  airtel_money:'Airtel Money',
  orange_money:'Orange Money',
  card:        'Card (Visa/Mastercard)',
  bank_transfer:'Bank transfer',
  wallet:      'CongoConnect wallet',
};

const METHOD_ICONS: Record<string, string> = {
  mpesa:        'M16 1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8zm1 5a2 2 0 0 0-2 2v2h4V8h-4z',
  airtel_money: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-2-14a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
  orange_money: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18a8 8 0 0 1-8-8 8 8 0 0 1 8-8 4 4 0 0 1 0 8h.5a2.5 2.5 0 0 1 0 5z',
  card:         'M3 6h18M3 12a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M3 18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6',
  bank_transfer:'M3 21h18M3 10h18M5 6l7-3 7 3M5 14l7 3 7-3',
  wallet:       'M19 5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1m4 8h.01',
};

export default function AccountPage() {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('marie@example.com');
  const [password, setPassword] = useState('password123');
  const [account, setAccount] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [payMsg, setPayMsg] = useState('');

  const [method, setMethod] = useState('mpesa');
  const [amount, setAmount] = useState(50);
  const [topupAmount, setTopupAmount] = useState(100);

  const login = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy('login');
    setError('');
    const r = await fetch('/api/auth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    setBusy('');
    if (!r.ok) { setError(d.error); return; }
    setUser({ id: d.data.id, email: d.data.email, name: d.data.name, role: d.data.role, walletBalanceUsd: d.data.walletBalanceUsd });
    await loadAccount(email);
  };

  const loadAccount = async (em: string) => {
    const r = await fetch(`/api/account?email=${encodeURIComponent(em)}`);
    const d = await r.json();
    if (r.ok) setAccount(d.data);
  };

  const charge = async () => {
    setBusy('pay');
    setPayMsg('');
    const r = await fetch('/api/payments/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, method, amountUsd: amount, purpose: 'service' }),
    });
    const d = await r.json();
    setBusy('');
    if (!r.ok) setPayMsg(`❌ ${d.data?.reason ?? d.error}`);
    else setPayMsg(`✅ Paid $${d.data.amountUsd} via ${METHOD_LABELS[method]}`);
    await loadAccount(email);
  };

  const topup = async () => {
    setBusy('topup');
    await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amountUsd: topupAmount }),
    });
    setPayMsg(`✅ Wallet topped up +$${topupAmount}`);
    setBusy('');
    await loadAccount(email);
  };

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0B2545]">
                Traveler account
              </h1>
              <p className="mt-0.5 text-sm text-[#7D7A74]">
                Wallet · payment methods · transaction history
              </p>
              <div className="mt-2 mx-auto h-1 w-24 rounded-full bg-[#D4AF37]" />
            </div>
            <Link
              href="/partner"
              className="hidden rounded-xl border border-[#D4AF37]/30 bg-white px-4 py-1.5 text-sm font-semibold text-[#8E6D14] shadow-sm transition-all duration-200 hover:bg-[#F5E7C7] sm:block"
            >
              Partner portal →
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 pb-24">
        {/* Login form */}
        {!account && (
          <form onSubmit={login} className="card card-elevated mb-8 max-w-md">
            <div className="px-6 py-5 border-b border-[#E2DFD9]">
              <h2 className="font-display text-xl font-bold text-[#0B2545]">
                Sign in
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <input
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                list="demo-emails"
              />
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={busy === 'login'}
                className="btn-primary w-full bg-[#0B2545] hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20 transition-all duration-200"
              >
                {busy === 'login' ? 'Signing in…' : 'Sign in'}
              </button>
              <p className="text-xs text-[#7D7A74] text-center">
                Demo: marie@example.com / password123
              </p>
              <datalist id="demo-emails">
                <option value="marie@example.com" />
                <option value="john@example.com" />
                <option value="admin@congoconnect.cd" />
              </datalist>
            </div>
          </form>
        )}

        {/* Authenticated dashboard */}
        {account && (
          <>
            {/* Wallet card */}
            <section className="mb-8">
              <div className="card card-elevated p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="label">Traveler account</p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-[#0B2545]">
                      {account.profile.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#7D7A74]">
                      {account.profile.email}
                      {account.profile.phone ? ` · ${account.profile.phone}` : ''}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs">
                      <button
                        onClick={async () => {
                          const r = await fetch('/api/account/request-verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: account.profile.email }),
                          });
                          const d = await r.json();
                          if (d.devToken) window.location.href = `/account/verify?token=${d.devToken}`;
                          else alert('Verification email sent (if configured).');
                        }}
                        className="text-[#0B2545] underline hover:no-underline"
                      >
                        Verify email
                      </button>
                      <Link href="/account/forgot" className="text-[#0B2545] underline hover:no-underline">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="label">Wallet balance</p>
                    <p className="mt-1 font-display text-4xl font-bold text-[#D4AF37]">
                      ${account.profile.walletBalanceUsd.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={topup}
                    disabled={busy === 'topup'}
                    className="btn-gold-outline flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-[#F5E7C7] hover:shadow-sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Top up wallet
                  </button>
                </div>

                {payMsg && (
                  <p className={`mt-4 rounded-xl p-3 text-sm ${
                    payMsg.startsWith('✅')
                      ? 'bg-[#E8F3EC] text-[#1B4D2E]'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {payMsg}
                  </p>
                )}
              </div>
            </section>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Payment methods */}
              <section className="card card-elevated p-6">
                <h3 className="font-display text-lg font-bold text-[#0B2545] mb-4">
                  Payment methods
                </h3>
                <div className="space-y-3">
                  {account.paymentMethods.map((m: any) => (
                    <div
                      key={m.id}
                      className={`rounded-xl border p-3.5 transition-all duration-200 ${
                        m.isDefault
                          ? 'border-[#D4AF37] bg-[#F5E7C7]'
                          : 'border-[#E2DFD9] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-[#FAF8F3] p-2">
                            <svg className="h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                              <path d={METHOD_ICONS[m.method] ?? 'M3 21h18M3 10h18M5 6l7-3 7 3M5 14l7 3 7-3'} />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#0B2545]">{m.label}</p>
                            <p className="text-xs text-[#7D7A74]">{m.kind?.replace('_', ' ') ?? 'Service'}</p>
                          </div>
                        </div>
                        {m.isDefault && (
                          <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold uppercase text-[#0F0F0E]">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {account.paymentMethods.length === 0 && (
                    <p className="text-sm text-[#7D7A74] text-center py-6">
                      No saved payment methods yet.
                    </p>
                  )}
                </div>
              </section>

              {/* Payment form */}
              <section className="card card-elevated p-6">
                <h3 className="font-display text-lg font-bold text-[#0B2545] mb-4">
                  Pay / top up
                </h3>

                <div className="space-y-4">
                  <div className="label">
                    Payment method
                    <div className="relative mt-1.5">
                      <select
                        className="select w-full pr-8"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                      >
                        {Object.entries(METHOD_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#7D7A74]">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="label">
                    Amount (USD)
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-semibold text-[#0B2545]">$</span>
                      <input
                        type="range"
                        min={5}
                        max={2000}
                        step={5}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="flex-1 accent-[#0B2545]"
                      />
                      <span className="text-sm font-bold text-[#0B2545] min-w-[60px] text-right">
                        ${amount}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={charge}
                    disabled={busy === 'pay'}
                    className="btn-primary w-full bg-[#0B2545] hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20 transition-all duration-200"
                  >
                    {busy === 'pay' ? 'Processing…' : `Charge $${amount}`}
                  </button>

                  <div className="border-t border-[#E2DFD9] pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#7D7A74]">Top up:</span>
                      <input
                        type="number"
                        className="input w-24 text-center"
                        min={10}
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(Number(e.target.value))}
                      />
                      <button
                        type="button"
                        onClick={topup}
                        disabled={busy === 'topup'}
                        className="btn-gold-outline px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
                      >
                        Top up
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Transactions table */}
            <section className="mt-8 card card-elevated overflow-hidden">
              <div className="border-b border-[#E2DFD9] px-6 py-4">
                <h3 className="font-display text-lg font-bold text-[#0B2545]">
                  Transactions
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2DFD9] text-left text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">
                      <th className="px-5 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Purpose</th>
                      <th className="px-4 py-3 font-semibold">Method</th>
                      <th className="px-4 py-3 font-semibold text-right">Amount</th>
                      <th className="px-5 py-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.transactions.map((tx: any) => (
                      <tr key={tx.reference} className="border-b border-[#E2DFD9] last:border-b-0 hover:bg-[#FAF8F3] transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-[#7D7A74]">
                          {tx.reference}
                        </td>
                        <td className="px-4 py-3 capitalize text-[#1A1A18]">
                          {tx.purpose}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#7D7A74]">
                            <span className="rounded-full bg-[#FAF8F3] p-1">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                <path d={METHOD_ICONS[tx.method] ?? 'M3 21h18M3 10h18M5 6l7-3 7 3M5 14l7 3 7-3'} />
                              </svg>
                            </span>
                            {METHOD_LABELS[tx.method] ?? tx.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#0B2545]">
                          ${tx.amountUsd.toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            tx.status === 'succeeded' ? 'bg-[#E8F3EC] text-[#1B4D2E]'
                            : tx.status === 'failed' ? 'bg-red-100 text-red-700'
                            : tx.status === 'refunded' ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#F5E7C7] text-[#8E6D14]'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {account.transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#7D7A74]">
                          No transactions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="mt-6 text-center text-sm text-[#7D7A74]">
              <Link href="/" className="text-[#0B2545] hover:underline">
                ← Back to home
              </Link>
              <span className="mx-2">·</span>
              <Link href="/partner" className="text-[#8E6D14] hover:underline">
                Partner portal →
              </Link>
            </p>
          </>
        )}
      </main>

      <style jsx>{`
        .label {
          display: block;
          margin-bottom: 0.375rem;
        }
        .label::before {
          content: attr(data-label);
        }
        [data-label] {
          display: block;
          margin-bottom: 0.375rem;
        }
        [data-label]::before {
          content: attr(data-label);
        }
      `}</style>
    </main>
  );
}
