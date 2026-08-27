'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

function BarChart({ data, color }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const fill = color || 'url(#revenueGradient)';

  return (
    <div className="flex h-44 items-end gap-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.value}`}>
          <div
            className="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: fill,
              minHeight: 4,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) setData(await res.json());
      } finally { setLoading(false); }
    })();
  }, []);

  const m = data?.data || {};
  const s = m.stats || {};

  const cards = [
    { label: 'Total Users', value: s.totalUsers, icon: '👥', color: 'bg-[#0B2545]/5 text-[#0B2545]' },
    { label: 'New Users (7d)', value: s.newUsers7d, icon: '🆕', color: 'bg-[#0B2545]/5 text-[#0B2545]' },
    { label: 'Total Bookings', value: s.totalBookings, icon: '🎫', color: 'bg-[#D4AF37]/5 text-[#8E6D14]' },
    { label: 'Revenue (USD)', value: `$${(s.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'bg-[#E8F3EC]/50 text-[#1B4D2E]' },
    { label: 'Revenue (7d)', value: `$${(s.revenue7d || 0).toLocaleString()}`, icon: '📈', color: 'bg-[#E8F3EC]/50 text-[#1B4D2E]' },
    { label: 'Flights', value: s.totalFlights, icon: '✈️', color: 'bg-[#E0E7FF]/50 text-[#0B2545]' },
    { label: 'Hotels', value: s.totalHotels, icon: '🏨', color: 'bg-[#E8F3EC]/50 text-[#1B4D2E]' },
    { label: 'Vehicles', value: s.totalVehicles, icon: '🚗', color: 'bg-[#F5E7C7]/50 text-[#8E6D14]' },
  ];

  const revSeries = (m.revenueSeries || []).map((d: { date: string; revenue: number }) => ({ label: d.date.slice(5), value: d.revenue }));
  const revByMethod = (m.revenueByMethod || []).map((d: { method: string; _sum?: { amount: number } }) => ({ label: d.method, value: Math.round((d._sum?.amount || 0) * 100) / 100 }));
  const routes = m.topRoutes || [];

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm text-[#7D7A74] hover:text-[#0B2545] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <span className="text-xs text-[#7D7A74]">/</span>
              <span className="text-sm font-semibold text-[#0B2545]">Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7D7A74]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-[#E2DFD9] bg-white h-24" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 mb-6">
              {cards.map((c) => (
                <div key={c.label} className="rounded-2xl border border-[#E2DFD9] bg-white p-4 shadow-sm">
                  <div className={`mt-0.5 text-2xl rounded-lg p-1.5 ${c.color}`}>
                    <span>{c.icon}</span>
                  </div>
                  <p className={`mt-1.5 font-display text-xl font-bold ${c.color.includes('text-[#0B2545]') ? 'text-[#0B2545]' : c.color.includes('text-[#8E6D14]') ? 'text-[#8E6D14]' : c.color.includes('text-[#1B4D2E]') ? 'text-[#1B4D2E]' : 'text-[#0B2545]'}`}>
                    {c.value ?? '—'}
                  </p>
                  <p className="text-xs text-[#7D7A74] mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <section className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#8E6D14]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M18 20V10M12 20V4M6 20v-6" />
                    </svg>
                  </div>
                  <h2 className="font-display text-base font-bold text-[#0B2545]">Revenue — last 30 days</h2>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#7D7A74]">
                  <span>Max: ${Math.max(...revSeries.map((d: { value: number }) => d.value))}</span>
                  <span className="h-2 w-px bg-[#E2DFD9]" />
                  <span>Total: ${revSeries.reduce((a: number, b: { value: number }) => a + b.value, 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="relative">
                {/* Gradient definition */}
                <svg className="absolute -right-4 -top-4 h-0 w-0">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>
                <BarChart data={revSeries} />
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {revSeries.slice(-10).map((d: { label: string }) => (
                    <span key={d.label} className="text-[10px] text-[#7D7A74] hidden sm:block">{d.label}</span>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Revenue by method */}
              <section className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B2545]/5 text-[#0B2545]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <h2 className="font-display text-base font-bold text-[#0B2545]">Revenue by method</h2>
                </div>
                {revByMethod.length ? (
                  <>
                    <div className="rounded-lg bg-[#FAF8F3] p-3 mb-3 overflow-hidden">
                      <BarChart data={revByMethod} color="#0B2545" />
                    </div>
                    <div className="space-y-1.5">
                      {revByMethod.map((d: { label: string; value: number }) => (
                        <div key={d.label} className="flex justify-between text-xs">
                          <span className="text-[#7D7A74]">{d.label}</span>
                          <span className="font-semibold text-[#0B2545]">${d.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#7D7A74]">No payments yet.</p>
                )}
              </section>

              {/* Top routes */}
              <section className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E0E7FF]/50 text-[#0B2545]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M14 18l6-6-6-6M18 15V3M3 21l3-3M3 9l6-6" />
                    </svg>
                  </div>
                  <h2 className="font-display text-base font-bold text-[#0B2545]">Top routes</h2>
                </div>
                {routes.length ? (
                  <div className="space-y-2">
                    {routes.map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#E2DFD9] last:border-b-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 text-center text-xs font-mono font-semibold text-[#8E6D14]">{i + 1}</span>
                          <span className="text-sm text-[#1A1A18] truncate">{r.route}</span>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-[#0B2545]">
                          {r.bookings} bookings
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#7D7A74]">No bookings yet.</p>
                )}
              </section>
            </div>

            {/* Recent bookings */}
            {m.recentBookings?.length > 0 && (
              <section className="mt-4 rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#8E6D14]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M9 12h6m-6 4h6M5 16H3M5 12H3M5 8H7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                      </svg>
                    </div>
                    <h2 className="font-display text-base font-bold text-[#0B2545]">Recent bookings</h2>
                  </div>
                  <span className="text-xs text-[#7D7A74]">{m.recentBookings.length} total</span>
                </div>
                <div className="divide-y divide-[#E2DFD9]">
                  {m.recentBookings.slice(0, 8).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between py-2 hover:bg-[#FAF8F3] transition-colors rounded-lg px-2 -mx-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0B2545]/5 text-[#0B2545] font-mono text-xs font-semibold shrink-0">
                          {String(b.flightNo || b.reference || b.id).slice(0, 3).toUpperCase()}
                        </div>
                        <span className="text-sm text-[#1A1A18] truncate">
                          {b.flightNo || b.reference || b.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#7D7A74]">{b.status}</span>
                        <span className="text-xs font-semibold text-[#0B2545]">
                          ${b.totalUsd?.toFixed(2) || '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}