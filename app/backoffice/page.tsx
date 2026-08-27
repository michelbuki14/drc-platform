'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

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

interface FlightBoardRow {
  id: string;
  flightNo: string;
  airline: string;
  origin: string;
  destination: string;
  schedDepart: string;
  status: string;
  delayMin: number;
}

function KpiCardComp({ title, value, change, trend, color }: KpiCard) {
  return (
    <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
      <p className="label text-[#7D7A74]">{title}</p>
      <p className={`mt-1 font-display text-3xl font-bold ${color ?? 'text-[#0B2545]'}`}>
        {value}
      </p>
      {change && (
        <p className={`mt-1.5 text-xs ${
          trend === 'up' ? 'text-[#1B4D2E]'
          : trend === 'down' ? 'text-red-600'
          : 'text-[#7D7A74]'
        }`}>
          {change}
        </p>
      )}
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#E2DFD9] py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B2545]/5 mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="font-display text-sm font-bold text-[#0B2545]">{title}</p>
      <p className="mt-1 text-xs text-[#7D7A74]">{desc}</p>
    </div>
  );
}

function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-[#E2DFD9] bg-white h-28" />
      ))}
    </div>
  );
}

export default function BackofficePage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'flights'>('overview');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KpiCard[]>([]);
  const [txs, setTxs] = useState<TXRow[]>([]);
  const [flights, setFlights] = useState<FlightBoardRow[]>([]);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (tab: string) => {
    setLoading(true);
    setError('');
    try {
      const base = '/api/backoffice';
      const views: Record<string, string> = {
        overview: `${base}?view=overview`,
        transactions: `${base}?view=transactions`,
        flights: `${base}?view=flights`,
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
          { title: 'Total bookings', value: data.data?.commerce?.bookingsCount ?? 0, change: 'all time', trend: 'up', color: 'text-[#0B2545]' },
          { title: 'Revenue (7d)', value: '$' + (data.data?.commerce?.bookingsTotalUsd ?? 0).toFixed(2), change: 'vs last period', trend: 'up', color: 'text-[#D4AF37]' },
          { title: 'Active flights', value: data.data?.flights?.activeCount ?? 0, change: 'in air', trend: 'neutral', color: 'text-[#1B4D2E]' },
          { title: 'Pending tickets', value: data.data?.cs?.openCount ?? 0, change: 'needs attention', trend: 'down', color: 'text-[#D97706]' },
          { title: 'Fraud flags', value: data.data?.fraud?.flaggedCount ?? 0, change: 'risk review', trend: 'down', color: 'text-red-600' },
          { title: 'Active partners', value: data.data?.partners?.approvedCount ?? 0, change: 'live on platform', trend: 'up', color: 'text-[#0B2545]' },
        ]);
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
      } else if (tab === 'flights') {
        setFlights((data.data?.flights ?? []).map((f: any) => ({
          id: f.id,
          flightNo: f.flightNo,
          airline: f.airline,
          origin: f.origin,
          destination: f.destination,
          schedDepart: f.schedDepart,
          status: f.status,
          delayMin: f.delayMin,
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
    if (status === 'succeeded' || status === 'active') return 'text-[#1B4D2E]';
    if (status === 'pending' || status === 'delayed') return 'text-[#D97706]';
    if (status === 'failed' || status === 'cancelled' || status === 'refunded') return 'text-red-600';
    return 'text-[#7D7A74]';
  };

  const flightStatusColor = (status: string) => {
    if (status === 'enroute' || status === 'arrived') return 'text-[#1B4D2E]';
    if (status === 'delayed' || status === 'diverted') return 'text-red-600';
    if (status === 'boarding' || status === 'departed') return 'text-[#0B2545]';
    return 'text-[#7D7A74]';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* ── Header ── */}
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-sm font-bold text-white shadow-sm">
                  C
                </div>
                <span className="text-base font-bold text-[#0B2545]">
                  Congo<span className="text-[#D4AF37]">Connect</span>
                </span>
              </Link>
              <span className="h-4 w-px bg-[#E2DFD9] hidden sm:block" />
              <span className="text-sm text-[#7D7A74] hidden sm:block">
                Backoffice · Control Center
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/backoffice/analytics" className="btn-gold-outline text-xs">
                Analytics
              </Link>
              <Link href="/customer-service" className="text-xs text-[#7D7A74] hover:text-[#0B2545] transition-colors">
                Support
              </Link>
              <Link href="/" className="text-xs text-[#7D7A74] hover:text-[#0B2545] transition-colors ml-2">
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="border-b border-[#E2DFD9] bg-white/50 px-4">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'transactions', label: 'Transactions' },
          { key: 'flights', label: 'Flight Board' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`mr-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-[#0B2545] text-[#0B2545]'
                : 'border-transparent text-[#7D7A74] hover:text-[#1A1A18]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-16">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            {loading ? (
              <LoadingSkeleton count={6} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi, i) => (
                  <KpiCardComp key={i} {...kpi} />
                ))}
              </div>
            )}

            {/* Quick links */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Link href="/backoffice/analytics" className="group flex flex-col items-center gap-3 rounded-2xl border border-[#E2DFD9] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545]/10 text-[#0B2545] transition-colors group-hover:bg-[#0B2545]/20">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-[#0B2545]">Analytics</p>
                  <p className="text-xs text-[#7D7A74]">Revenue, trends, reports</p>
                </div>
              </Link>
              <Link href="/customer-service" className="group flex flex-col items-center gap-3 rounded-2xl border border-[#E2DFD9] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D97706]/10 text-[#D97706] transition-colors group-hover:bg-[#D97706]/20">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-[#0B2545]">Support</p>
                  <p className="text-xs text-[#7D7A74]">Tickets, complaints</p>
                </div>
              </Link>
              <Link href="/api/commission?pending=1" className="group flex flex-col items-center gap-3 rounded-2xl border border-[#E2DFD9] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#8E6D14] transition-colors group-hover:bg-[#D4AF37]/20">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-[#0B2545]">Ledger</p>
                  <p className="text-xs text-[#7D7A74]">Partner payouts</p>
                </div>
              </Link>
            </div>
          </>
        )}

        {activeTab === 'transactions' && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#7D7A74]">
                {txs.length} transaction{txs.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => fetchData('transactions')}
                className="text-xs text-[#0B2545] hover:underline font-medium"
              >
                Refresh
              </button>
            </div>

            {txs.length === 0 ? (
              <EmptyState icon="💳" title="No transactions yet" desc="Payments will appear here once customers start booking." />
            ) : (
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div key={tx.reference} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-[#E2DFD9] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B2545]/10 text-[#0B2545] font-bold text-xs">
                        {tx.reference.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-[#0B2545]">{tx.reference}</p>
                        <p className="text-xs text-[#7D7A74]">
                          {tx.user?.firstName} {tx.user?.lastName} ({tx.user?.email})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="text-sm font-display font-bold text-[#0B2545]">${tx.amountUsd.toFixed(2)}</span>
                      <span className="text-xs text-[#7D7A74]">{tx.method}</span>
                      <span className={`text-xs font-medium ${statusColor(tx.status)}`}>{tx.status}</span>
                      <span className="text-xs text-[#7D7A74] w-20 text-right">{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'flights' && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#7D7A74]">
                {flights.length} flight{flights.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => fetchData('flights')}
                className="text-xs text-[#0B2545] hover:underline font-medium"
              >
                Refresh
              </button>
            </div>

            {flights.length === 0 ? (
              <EmptyState icon="✈️" title="No active flights" desc="Flight board will show real-time status here." />
            ) : (
              <div className="space-y-2">
                {flights.map((f) => (
                  <div key={f.id} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-[#E2DFD9] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B2545]/10 text-[#0B2545] font-bold text-xs">
                        {f.flightNo.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-[#0B2545]">{f.flightNo} — {f.airline}</p>
                        <p className="text-xs text-[#7D7A74]">
                          {f.origin} → {f.destination} · {f.schedDepart}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {f.delayMin > 0 && (
                        <span className="text-xs font-medium text-red-600">+{f.delayMin}m</span>
                      )}
                      <span className={`text-xs font-medium ${flightStatusColor(f.status)}`}>{f.status}</span>
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
