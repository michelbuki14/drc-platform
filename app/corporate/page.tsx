'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

export default function CorporateTravelPage() {
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/corporate')
      .then((r) => r.json())
      .then((data) => setAccounts(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
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
              <span className="text-sm text-[#7D7A74] font-medium">Corporate Travel</span>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors">
                ← Home
              </Link>
              <Link href="/flights" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors ml-2">
                Flights
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-16">
        {/* Hero */}
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#0B2545] via-[#0B2545] to-[#1a3a4a] p-6 sm:p-8 text-white shadow-[0_8px_24px_rgba(11,37,69,0.25)] border border-[#081A33]/50">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#D4AF37]/[0.06] blur-2xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-8 h-24 w-24 rounded-full bg-[#0B2545]/[0.3] blur-xl" />
          <div className="relative">
            <p className="label text-xs font-medium uppercase tracking-[0.2em] opacity-70">Enterprise</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Corporate Travel Management
            </h1>
            <p className="mt-1 text-sm opacity-90 max-w-2xl">
              Centralized travel for enterprises — policy controls, approvals, spend tracking
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Company list */}
          <div className="lg:col-span-2 rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B2545]/5 text-[#0B2545] text-xs font-bold">🏢</div>
                <h2 className="font-display text-base font-bold text-[#0B2545]">Registered Companies</h2>
              </div>
              <span className="text-xs text-[#7D7A74]">{accounts.length} accounts</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
                </div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545]/5 mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <p className="text-sm font-medium text-[#0B2545]">No corporate accounts</p>
                <p className="mt-1 text-xs text-[#7D7A74]">Register your company to start managing travel</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <div key={acc.id} className="group flex items-start justify-between rounded-xl border border-[#E2DFD9] bg-[#FAF8F3] p-4 hover:bg-white hover:border-[#0B2545]/[0.12] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-[#0B2545]">{acc.companyName}</p>
                      <div className="mt-1 text-xs text-[#7D7A74]">
                        <p>
                          👤 {acc.contactName} · {acc.email}
                        </p>
                        <p>
                          💼 {acc.memberCount} members · {acc.policyCount} policies · {acc.bookingCount} bookings
                        </p>
                        <p className="mt-0.5 font-semibold text-[#8E6D14]">
                          Spend to date: ${acc.spentToDateUsd.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <Link
                        href={`/corporate/${acc.id}`}
                        className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors"
                      >
                        Manage
                      </Link>
                      <Link
                        href={`/flights?corp=${acc.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0B2545] px-3 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#081A33]"
                      >
                        Book
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Why corporate */}
          <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#8E6D14] text-xs font-bold">✨</div>
              <h2 className="font-display text-base font-bold text-[#0B2545]">Why Corporate?</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: 'Policy Controls',
                  desc: 'Set spending limits, allowed airlines, advance booking rules, and class restrictions per company.',
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                },
                {
                  title: 'Approval Workflows',
                  desc: 'Require manager approval for bookings over a threshold — keep spend under control.',
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                  ),
                },
                {
                  title: 'Spend Tracking',
                  desc: 'Real-time view of bookings, spend by department, member, and policy — export anytime.',
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  ),
                },
                {
                  title: 'Member Management',
                  desc: 'Add employees, assign departments, set default payment methods.',
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ),
                },
                {
                  title: 'Central Billing',
                  desc: 'Consolidated invoicing, wallet funding, and commission reporting per account.',
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg bg-[#FAF8F3] p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <p className="font-semibold text-sm text-[#0B2545]">{item.title}</p>
                      <p className="text-xs text-[#7D7A74] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
