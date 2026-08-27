'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

export default function CorporateDetailPage() {
  const { t } = useI18n();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') || 'cc1' : 'cc1';
    fetch(`/api/corporate?id=${id}`)
      .then(r => r.json())
      .then(data => setAccount(data.data))
      .finally(() => setLoading(false));
  }, []);

  const tabs = ['Overview', 'Members', 'Policies', 'Bookings'];
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">C</span>
                <span className="text-base font-bold text-[var(--color-primary)]">Congo<span className="text-[var(--color-accent)]">Connect</span></span>
              </Link>
              <span className="text-sm text-[var(--color-text-muted)]">Corporate Details</span>
            </div>
            <div className="flex gap-2">
              <Link href="/corporate" className="btn-ghost text-xs">← All Companies</Link>
              <Link href="/" className="btn-ghost text-xs">Home</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/>
          </div>
        ) : account ? (
          <>
            {/* Header */}
            <div className="mb-6 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-[var(--color-text)]">{account.companyName}</h1>
                  <p className="text-sm text-[var(--color-text-muted)]">{account.contactName} · {account.email}</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span>👥 {account.memberCount} members</span>
                    <span>📋 {account.policyCount} policies</span>
                    <span>✈️ {account.bookingCount} bookings</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)]">Spend to date</p>
                  <p className="text-2xl font-bold text-[var(--color-primary)]">${account.spentToDateUsd.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[var(--color-border-subtle)] mb-4 overflow-x-auto">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === i
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-medium'
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 min-h-[400px]">
              {activeTab === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard label="Members" value={account.memberCount}/>
                    <StatCard label="Policies" value={account.policyCount}/>
                    <StatCard label="Bookings" value={account.bookingCount}/>
                  </div>
                  <div className="rounded-lg bg-[var(--color-bg)] p-4">
                    <h3 className="font-semibold text-[var(--color-text)] mb-2">Policies</h3>
                    {account.policies.length === 0 ? (
                      <p className="text-sm text-[var(--color-text-muted)]">No policies set.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {account.policies.map((p: any) => (
                                                      <div key={p.id} className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-text)]">{p.name}</span>
                            <span className="text-xs text-[var(--color-text-muted)]">Class: {p.classAllowed} · Max: ${p.maxSpendUsd}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg bg-[var(--color-bg)] p-4">
                    <h3 className="font-semibold text-[var(--color-text)] mb-2">Recent Bookings</h3>
                    {account.recentBookings.length === 0 ? (
                      <p className="text-sm text-[var(--color-text-muted)]">No bookings yet.</p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {account.recentBookings.map((b: any) => (
                                                      <div key={b.id} className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-text)]">{b.productName}</span>
                            <span className={b.status === 'booked' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}>{b.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-3">Members ({account.members.length})</h3>
                  {account.members.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">No members yet.</p>
                  ) : (
                    <div className="divide-y divide-[var(--color-border-subtle)]">
                      {account.members.map((m: any) => (
                                            <div key={m.id} className="py-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">{m.firstName} {m.lastName}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{m.email}</p>
                          </div>
                          <span className="text-xs text-[var(--color-text-muted)]">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 2 && (
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-3">Policies ({account.policies.length})</h3>
                  {account.policies.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">No policies configured.</p>
                  ) : (
                    <div className="space-y-4">
                      {account.policies.map((p: any) => (
                        <div key={p.id} className="rounded-lg bg-[var(--color-bg)] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-[var(--color-text)]">{p.name}</p>
                            <span className="text-xs text-[var(--color-text-muted)]">{p.classAllowed}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]">
                            <div>Max spend: <strong>${p.maxSpendUsd}</strong></div>
                            <div>Advance: <strong>{p.maxAdvanceBookingDays}d</strong></div>
                            <div>Last minute: <strong>{p.maxLastMinuteDays}d</strong></div>
                            <div>Approval: <strong>{p.requiresApproval ? 'required' : 'not required'}</strong></div>
                          </div>
                          {p.allowedAirlines && <p className="mt-2 text-xs text-[var(--color-text-muted)]">Airlines: {p.allowedAirlines}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 3 && (
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-3">Bookings ({account.recentBookings.length})</h3>
                  {account.recentBookings.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">No bookings yet.</p>
                  ) : (
                    <div className="divide-y divide-[var(--color-border-subtle)]">
                      {account.recentBookings.map((b: any) => (
                        <div key={b.id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">{b.productName}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{b.bookingRef} · {b.member?.firstName} {b.member?.lastName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[var(--color-text)]">${b.totalUsd.toLocaleString()}</p>
                            <span className={b.status === 'booked' ? 'text-[var(--color-success)] text-xs' : 'text-[var(--color-text-muted)] text-xs'}>{b.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--color-text-muted)]">Account not found</p>
            <Link href="/corporate" className="btn-ghost text-xs mt-2 inline-block">← Back to companies</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({label, value}: {label: string; value: number}) {
  return (
    <div className="rounded-lg bg-[var(--color-bg)] p-4 text-center">
      <p className="text-2xl font-bold text-[var(--color-primary)]">{value}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
