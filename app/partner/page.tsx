'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

/* ────────────────────────────────────────────────────────────
   CongoConnect Partner Portal
   Partner profile, commission balance, sales history, payouts
   ──────────────────────────────────────────────────────────── */

interface PartnerProfile {
  id: string;
  company: string;
  contactEmail: string;
  category: string;
  commissionPct: number;
  balanceUsd: number;
  status: string;
  createdAt: string;
}

interface Sale {
  id: string;
  productType: string;
  productRef: string;
  customerName: string;
  amountUsd: number;
  commissionUsd: number;
  createdAt: string;
}

interface SaleForm {
  bookingRef: string;
  customerName: string;
  amountUsd: string;
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/5">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--color-text)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{desc}</p>
    </div>
  );
}

export default function PartnerPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'dashboard' | 'sales' | 'payouts'>('dashboard');
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<SaleForm>({
    bookingRef: '', customerName: '', amountUsd: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, salesRes] = await Promise.all([
        fetch('/api/partner'),
        fetch('/api/commission?partnerId=me'),
      ]);
      if (!profileRes.ok) throw new Error('Failed to load partner profile');
      const profileData = await profileRes.json();
      setProfile(profileData.data);

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSales(salesData.data?.ledger?.recentSales ?? []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitSale = async () => {
    if (!form.bookingRef || !form.customerName || !form.amountUsd) {
      setError('All fields are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/partner/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef: form.bookingRef,
          customerName: form.customerName,
          amountUsd: parseFloat(form.amountUsd),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to submit sale');
      }
      setForm({ bookingRef: '', customerName: '', amountUsd: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalSales = sales.reduce((s, sale) => s + sale.amountUsd, 0);
  const totalCommission = sales.reduce((s, sale) => s + sale.commissionUsd, 0);

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
              <span className="text-sm text-[var(--color-text-muted)] hidden sm:block">Partner Portal</span>
            </div>
            <Link href="/" className="btn-ghost text-xs">← Home</Link>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 px-4">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'sales', label: 'Sales' },
          { key: 'payouts', label: 'Payouts' },
        ].map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setTab(key as any)}
            className={`mr-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        {error && <div className="mb-4 rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">{error}</div>}

        {tab === 'dashboard' && (
          <>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {[1,2,3].map(n => <div key={n} className="animate-pulse rounded-2xl bg-[var(--color-surface)] h-28"/>)}
              </div>
            ) : profile ? (
              <>
                {/* Profile card */}
                <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-sm mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xl font-bold">
                      {profile.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--color-text)]">{profile.company}</h2>
                      <p className="text-sm text-[var(--color-text-muted)]">{profile.contactEmail} · {profile.category}</p>
                    </div>
                    <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${profile.status === 'approved' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'}`}>
                      {profile.status}
                    </span>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Commission balance</p>
                    <p className="mt-1 text-3xl font-bold text-[var(--color-primary)]">${profile.balanceUsd.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Total sales</p>
                    <p className="mt-1 text-3xl font-bold text-[var(--color-accent)]">${totalSales.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Commission earned</p>
                    <p className="mt-1 text-3xl font-bold text-[var(--color-success)]">${totalCommission.toFixed(2)}</p>
                  </div>
                </div>

                {/* Commission rate */}
                <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Commission rate</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{profile.commissionPct}%</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">On every transaction you refer</p>
                </div>
              </>
            ) : (
              <EmptyState icon="🏢" title="No partner profile" desc="Your partner account is being set up."/>
            )}
          </>
        )}

        {tab === 'sales' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-muted)]">{sales.length} sale{sales.length !== 1 ? 's' : ''}</p>
              <button type="button" onClick={fetchData} className="text-xs text-[var(--color-primary)] hover:underline">Refresh</button>
            </div>

            {/* New sale form */}
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-sm mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Submit new sale</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Booking ref</label>
                  <input type="text" value={form.bookingRef} onChange={(e) => setForm({...form, bookingRef: e.target.value})} placeholder="Booking ref or tracking no." className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Customer name</label>
                  <input type="text" value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Amount (USD)</label>
                  <input type="number" value={form.amountUsd} onChange={(e) => setForm({...form, amountUsd: e.target.value})} placeholder="100.00" className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
              </div>
              <button type="button" onClick={submitSale} disabled={submitting} className="btn-primary mt-4 px-6">
                {submitting ? 'Submitting...' : 'Submit sale'}
              </button>
            </div>

            {sales.length === 0 ? (
              <EmptyState icon="📊" title="No sales yet" desc="Submit your first sale using the form above."/>
            ) : (
              <div className="space-y-2">
                {sales.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">{s.productRef}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{s.customerName} · {s.productType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--color-text)]">${s.amountUsd.toFixed(2)}</p>
                      <p className="text-xs text-[var(--color-success)]">+${s.commissionUsd.toFixed(2)} commission</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'payouts' && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Payout history</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Payouts are processed monthly. Contact support for early payout requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
