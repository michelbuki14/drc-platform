'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) setUsers((await res.json()).data || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = users.filter((u: any) =>
    u.email?.toLowerCase().includes(q.toLowerCase()) ||
    u.name?.toLowerCase().includes(q.toLowerCase())
  );

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
              <span className="text-sm font-semibold text-[#0B2545]">Users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7D7A74]">{filtered.length} users</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-16">
        {/* Search */}
        <div className="relative mb-4">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users by name or email…"
            className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse rounded-xl border border-[#E2DFD9] bg-white h-14" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E2DFD9] bg-white shadow-sm">
            {/* Header row */}
            <div className="grid grid-cols-2 gap-3 border-b border-[#E2DFD9] px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#7D7A74]">
              <span>Name</span>
              <span className="hidden sm:block">Email</span>
              <span>Role</span>
              <span className="hidden sm:block text-right">Wallet</span>
            </div>

            {/* Rows */}
            {filtered.map((u: any) => (
              <div
                key={u.id}
                className="group grid grid-cols-2 gap-3 border-b border-[#E2DFD9] last:border-b-0 px-4 py-3 text-sm hover:bg-[#FAF8F3] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#0B2545] truncate">{u.name}</p>
                  <p className="hidden sm:block truncate text-[#7D7A74]">{u.email}</p>
                </div>
                <span className="rounded-full bg-[#0B2545]/10 px-2 py-0.5 text-xs font-semibold text-[#0B2545] shrink-0">
                  {u.role}
                </span>
                <span className="hidden sm:block text-right text-[#7D7A74]">
                  ${u.walletBalanceUsd?.toFixed(2) || '0.00'}
                </span>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#7D7A74]">No users found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
