'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

// ── Types ──
interface KpiCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

interface TXRow {
  reference: string;
  amountUsd: number;
  currency: string;
  method: string;
  status: string;
  purpose: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

interface PartnerRow {
  id: string;
  company: string;
  contactEmail: string;
  category: string;
  status: string;
  commissionPct: number;
  balanceUsd: number;
  salesCount: number;
}

interface ComplaintRow {
  id: string;
  reference: string;
  userId: string;
  type: string;
  summary: string;
  status: string;
  priority: string;
  category: string;
  sourceRef: string;
  createdAt: string;
}

interface ChartPoint {
  label: string;
  value: number;
}

// ── Components ──

function KpiCardComp({ title, value, change, trend, color }: KpiCard) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        {title}
      </p>
      <p className={`mt-1 font-display text-3xl font-bold ${color ?? 'text-[var(--color-primary)]'}`}>
        {value}
      </p>
      {change && (
        <p className={`mt-1.5 text-xs ${trend === 'up' ? 'text-[var(--color-success)]' : trend === 'down' ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'}`}>
          {change}
        </p>
      )}
    </div>
  );
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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/>
    </div>
  );
}

// ── Page ──

export default function BackofficeAnalyticsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics' | 'cs' | 'refunds' | 'ledger'>('overview');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KpiCard[]>([]);
  const [txs, setTxs] = useState<TXRow[]>([]);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [refunds, setRefunds] = useState<{ reference: string; amountUsd: number; originalReference: string; status: string; createdAt: string }[]>([]);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<{ daily: ChartPoint[]; byMethod: { method: string; value: number }[] }>({ daily: [], byMethod: [] });

  const fetchData = useCallback(async (tab: string) => {
    setLoading(true);
    setError('');
    try {
      const base = '/api/backoffice';
      const views: Record<string, string> = {
        overview: `${base}?view=overview`,
        transactions: `${base}?view=transactions`,
        analytics: `${base}?view=analytics`,
        cs: `${base}?view=complaints`,
        refunds: `${base}?view=refunds`,
        ledger: `${base}?view=ledger`,
      };
      const url = views[tab] ?? views.overview;

      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to fetch');
      }
      const data = await res.json();

      if (tab === 'overview') {
        setKpis([
          { title: 'Platform revenue (7d)', value: '$' + (data.data?.commerce?.bookingsTotalUsd ?? 0), change: 'vs last period', trend: 'up', color: 'text-[var(--color-primary)]' },
          { title: 'Payment volume (7d)', value: '$' + (data.data?.payments?.succeededTotalUsd ?? 0), change: 'all methods', trend: 'neutral', color: 'text-[var(--color-accent)]' },
          { title: 'Open tickets', value: data.data?.cs?.openCount ?? 0, change: 'needs attention', trend: 'down', color: 'text-[var(--color-warning)]' },
          { title: 'Partner payout (pending)', value: '$' + (data.data?.ledger?.pendingPayoutUsd ?? 0), change: 'commission owed', trend: 'neutral', color: 'text-[var(--color-success)]' },
          { title: 'Fraud flags (7d)', value: data.data?.fraud?.flaggedCount ?? 0, change: 'risk review', trend: 'down', color: 'text-[var(--color-error)]' },
          { title: 'Active partners', value: data.data?.partners?.approvedCount ?? 0, change: 'live on platform', trend: 'up', color: 'text-[var(--color-primary)]' },
        ]);
        setChartData({
          daily: (data.data?.analytics?.dailyRevenue ?? []).map((d: any) => ({ label: d.day, value: d.amountUsd })),
          byMethod: (data.data?.payments?.byMethod ?? []).map((m: any) => ({ method: m.method, value: m.totalUsd })),
        });
      } else if (tab === 'transactions') {
        setTxs((data.data?.data ?? []).map((tx: any) => ({
          reference: tx.reference,
          amountUsd: tx.amountUsd,
          currency: tx.currency,
          method: tx.method,
          status: tx.status,
          purpose: tx.purpose,
          createdAt: tx.createdAt,
          user: tx.user,
        })));
      } else if (tab === 'analytics') {
        setChartData({
          daily: (data.data?.analytics?.dailyRevenue ?? []).map((d: any) => ({ label: d.day, value: d.amountUsd })),
          byMethod: (data.data?.payments?.byMethod ?? []).map((m: any) => ({ method: m.method, value: m.totalUsd })),
        });
      } else if (tab === 'cs') {
        setComplaints((data.data?.complaints ?? []).map((c: any) => ({
          id: c.id,
          reference: c.reference,
          userId: c.userId,
          type: c.type,
          summary: c.summary,
          status: c.status,
          priority: c.priority,
          category: c.category,
          sourceRef: c.sourceRef,
          createdAt: c.createdAt,
        })));
      } else if (tab === 'refunds') {
        setRefunds((data.data?.refunds ?? []).map((r: any) => ({
          reference: r.reference,
          amountUsd: r.amountUsd,
          originalReference: r.originalReference,
          status: r.status,
          createdAt: r.createdAt,
        })));
      } else if (tab === 'ledger') {
        setPartners((data.data?.ledger?.partners ?? []).map((p: any) => ({
          id: p.id,
          company: p.company,
          contactEmail: p.contactEmail,
          category: p.category,
          status: p.status,
          commissionPct: p.commissionPct,
          balanceUsd: p.balanceUsd,
          salesCount: p.salesCount,
        })));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const statusColor = (status: string) => {
    if (status === 'succeeded') return 'text-[var(--color-success)]';
    if (status === 'pending') return 'text-[var(--color-warning)]';
    if (status === 'failed' || status === 'refunded') return 'text-[var(--color-error)]';
    return 'text-[var(--color-text-muted)]';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">
                  C
                </span>
                <span className="text-base font-bold text-[var(--color-primary)]">
                  Congo<span className="text-[var(--color-accent)]">Connect</span>
                </span>
              </Link>
              <span className="h-4 w-px bg-[var(--color-border)] hidden sm:block"/>
              <span className="text-sm text-[var(--color-text-muted)] hidden sm:block">
                Backoffice • Analytics & Control
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/backoffice" className="btn-ghost text-xs">
                ← All
              </Link>
              <Link href="/" className="btn-ghost text-xs">
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="sticky top-[4.5rem] z-20 border-b border-[var(--color-border-subtle)] bg-white/80 backdrop-blur-md sm:hidden">
        <div className="flex gap-1 overflow-x-auto px-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'transactions', label: 'Payments' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'cs', label: 'Support' },
            { key: 'refunds', label: 'Refunds' },
            { key: 'ledger', label: 'Ledger' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as any)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === key
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop tab nav ── */}
      <div className="hidden sm:flex border-b border-[var(--color-border-subtle)] bg-white/50 px-4">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'transactions', label: 'Payments' },
          { key: 'analytics', label: 'Analytics' },
          { key: 'cs', label: 'Support' },
          { key: 'refunds', label: 'Refunds' },
          { key: 'ledger', label: 'Ledger' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`mr-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        {error && (
          <div className="mb-4 rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
            {error}
          </div>
        )}

        {loading && activeTab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] h-28"/>
            ))}
          </div>
        )}

        {activeTab === 'overview' && !loading && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi, i) => (
                <KpiCardComp key={i} {...kpi}/>
              ))}
            </div>

            {/* Revenue chart */}
            {chartData.daily.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Revenue trend (last 7 days)</h3>
                <div className="flex items-end gap-2 h-32">
                  {chartData.daily.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full rounded-t-md bg-[var(--color-accent)] transition-all"
                        style={{ height: `${Math.max(4, (d.value / Math.max(...chartData.daily.map(p => p.value), 1)) * 100)}%` }}
                      />
                      <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{d.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By-method breakdown */}
            {chartData.byMethod.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Payment volume by method</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {chartData.byMethod.map((m) => (
                    <div key={m.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold">
                          {m.method.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-[var(--color-text)]">
                          {m.method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-primary)]">
                        ${m.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kpis.length === 0 && (
              <EmptyState icon="📊" title="No analytics data" desc="The platform needs to be processing payments to show analytics here."/>
            )}
          </>
        )}

        {activeTab === 'transactions' && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {txs.length} transaction{txs.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => fetchData('transactions')}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Refresh
              </button>
            </div>

            {txs.length === 0 ? (
              <EmptyState icon="💳" title="No transactions yet" desc="Payments will appear here once customers start booking."/>
            ) : (
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div key={tx.reference} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-xs">
                        {tx.reference.slice(0, 3)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">{tx.reference}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {tx.user?.firstName} {tx.user?.lastName} ({tx.user?.email})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="text-sm font-semibold text-[var(--color-text)]">${tx.amountUsd.toFixed(2)}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{tx.method}</span>
                      <span className={`text-xs font-medium ${statusColor(tx.status)}`}>{tx.status}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{tx.purpose}</span>
                      <span className="text-xs text-[var(--color-text-muted)] w-20 text-right">{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && !loading && (
          <>
            {chartData.daily.length === 0 ? (
              <EmptyState icon="📈" title="No analytics yet" desc="Revenue and payment trends will appear here once the platform is live."/>
            ) : (
              <>
                <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Revenue trend</h3>
                  <div className="flex items-end gap-2 h-40">
                    {chartData.daily.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full rounded-t-md bg-[var(--color-accent)] transition-all"
                          style={{ height: `${Math.max(4, (d.value / Math.max(...chartData.daily.map(p => p.value), 1)) * 100)}%` }}
                        />
                        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{d.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Revenue by method</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {chartData.byMethod.map((m) => (
                      <div key={m.method} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)]/50">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold">
                            {m.method.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-[var(--color-text)]">
                            {m.method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-primary)]">
                          ${m.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'cs' && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {complaints.length} ticket{complaints.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => fetchData('cs')}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Refresh
              </button>
            </div>

            {complaints.length === 0 ? (
              <EmptyState icon="🎫" title="No support tickets" desc="Customer inquiries and complaints will appear here."/>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--color-text-muted)]">{c.reference}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          c.priority === 'urgent' ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                          : c.priority === 'high' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                          : c.status === 'resolved' || c.status === 'closed' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                          : 'bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)]'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <span>{c.type}</span>
                        <span>·</span>
                        <span>{c.category}</span>
                        <span>·</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text)]">{c.summary}</p>
                    {c.sourceRef && (
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">Reference: {c.sourceRef}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'refunds' && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {refunds.length} refund{refunds.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => fetchData('refunds')}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Refresh
              </button>
            </div>

            {refunds.length === 0 ? (
              <EmptyState icon="↩️" title="No refunds yet" desc="Refunds will appear here once processed."/>
            ) : (
              <div className="space-y-2">
                {refunds.map((r) => (
                  <div key={r.reference} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] font-bold text-xs">
                        ↩
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">{r.reference}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Refund of {r.originalReference}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[var(--color-success)]">-${r.amountUsd.toFixed(2)}</span>
                      <span className={`text-xs font-medium ${r.status === 'succeeded' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`}>
                        {r.status}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] w-20 text-right">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'ledger' && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {partners.length} partner{partners.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => fetchData('ledger')}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Refresh
              </button>
            </div>

            {partners.length === 0 ? (
              <EmptyState icon="🤝" title="No partners" desc="Partner agencies will appear here once registered."/>
            ) : (
              <div className="space-y-2">
                {partners.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold text-xs">
                        P
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">{p.company}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{p.contactEmail} · {p.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="text-xs text-[var(--color-text-muted)]">{p.status}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{p.commissionPct}% comm.</span>
                      <span className="text-sm font-semibold text-[var(--color-success)]">${p.balanceUsd.toFixed(2)}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{p.salesCount} sales</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
