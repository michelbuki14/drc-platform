'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  totalFlights: number;
  totalHotels: number;
  totalVehicles: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics').then((r) => r.json()),
      fetch('/api/admin/users?limit=10').then((r) => r.json()),
    ]).then(([analytics, userData]) => {
      setStats(analytics.data?.stats || {});
      setUsers(userData.data || []);
      setRecentBookings(analytics.data?.recentBookings || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
        </div>
        <p className="text-sm text-[#7D7A74]">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0B2545]">Admin Dashboard</h1>
              <p className="mt-0.5 text-sm text-[#7D7A74]">Analytics, user management, and system overview</p>
              <div className="mt-2 mx-auto h-1 w-24 rounded-full bg-[#D4AF37]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7D7A74]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* KPI cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-[#0B2545]', bg: 'bg-[#0B2545]/5' },
            { label: 'Bookings', value: stats?.totalBookings || 0, color: 'text-[#8E6D14]', bg: 'bg-[#D4AF37]/5' },
            { label: 'Revenue', value: `$${Math.floor(stats?.totalRevenue || 0).toLocaleString()}`, color: 'text-[#1B4D2E]', bg: 'bg-[#E8F3EC]/50' },
            { label: 'Flights', value: stats?.totalFlights || 0, color: 'text-[#1B4D2E]', bg: 'bg-[#E0E7FF]/50' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border border-[#E2DFD9] ${stat.bg} p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
              <p className="label text-xs uppercase tracking-[0.15em] text-[#7D7A74] font-semibold">{stat.label}</p>
              <p className={`mt-1 font-display text-3xl sm:text-4xl font-bold ${stat.color}`}>{stat.value}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#7D7A74]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                <span>Live</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent bookings */}
        <section className="mb-8">
          <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#0B2545]">Recent Bookings</h2>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#8E6D14]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M9 12h6m-6 4h6M5 16H3M5 12H3M5 8H7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                </svg>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2DFD9] text-left text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Flight</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                    <th className="px-4 py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b: any) => (
                    <tr key={b.id} className="border-b border-[#E2DFD9] last:border-b-0 hover:bg-[#FAF8F3] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#8E6D14]">{b.reference}</td>
                      <td className="px-4 py-3 text-[#1A1A18]">{b.user?.email || 'N/A'}</td>
                      <td className="px-4 py-3 text-[#1A1A18]">{b.flight?.flightNo || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#0B2545]">${b.totalUsd}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F3EC] px-2 py-0.5 text-xs font-semibold text-[#1B4D2E]">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#7D7A74]">No bookings yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Users table */}
        <section>
          <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#0B2545]">Users ({users.length})</h2>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B2545]/5 text-[#0B2545]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2DFD9] text-left text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold text-right">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b border-[#E2DFD9] last:border-b-0 hover:bg-[#FAF8F3] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#0B2545]">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-4 py-3 text-[#1A1A18]">{u.email}</td>
                      <td className="px-4 py-3 capitalize text-[#7D7A74]">{u.role}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#0B2545]">
                        {u._count?.bookings || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
