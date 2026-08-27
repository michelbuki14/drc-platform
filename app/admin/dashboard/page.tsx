'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
    totalFlights: number;
    totalVehicles: number;
    totalHotels: number;
    totalAttractions: number;
    totalTours: number;
  };
  recentBookings: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      setData(data.data);
    } catch (e) {
      console.error('Failed:', e);
    } finally {
      setLoading(false);
    }
  };

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

  if (!data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-sm text-[#7D7A74]">No data available.</p>
    </div>
  );

  const stats = data.stats;

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0B2545]">Admin Dashboard</h1>
              <p className="mt-0.5 text-sm text-[#7D7A74]">Platform analytics</p>
              <div className="mt-2 mx-auto h-1 w-24 rounded-full bg-[#D4AF37]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7D7A74]">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* KPI cards */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, color: 'text-[#0B2545]', bg: 'bg-[#0B2545]/5' },
            { label: 'Total Bookings', value: stats.totalBookings, color: 'text-[#8E6D14]', bg: 'bg-[#D4AF37]/5' },
            { label: 'Revenue', value: `$${Math.floor(stats.totalRevenue).toLocaleString()}`, color: 'text-[#1B4D2E]', bg: 'bg-[#E8F3EC]/50' },
            { label: 'Active Flights', value: stats.totalFlights, color: 'text-[#1B4D2E]', bg: 'bg-[#E0E7FF]/50' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl border border-[#E2DFD9] ${stat.bg} p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
              <p className="label text-xs uppercase tracking-[0.15em] text-[#7D7A74] font-semibold">{stat.label}</p>
              <p className={`mt-2 font-display text-3xl sm:text-4xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#7D7A74]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                <span>Live</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2 mb-8">
          {/* Revenue overview */}
          <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#0B2545]">Revenue Overview</h2>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B2545]/5 text-[#0B2545]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
            </div>
            <div className="rounded-lg bg-[#FAF8F3] p-4">
              {[
                { label: 'Total Revenue', value: `$${Math.floor(stats.totalRevenue).toLocaleString()}` },
                { label: 'Transactions', value: stats.totalBookings },
                { label: 'Vehicles', value: stats.totalVehicles },
                { label: 'Hotels', value: stats.totalHotels },
              ].map((row, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-[#E2DFD9] last:border-b-0">
                  <span className="text-[#7D7A74]">{row.label}</span>
                  <span className="font-semibold text-[#0B2545]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent bookings */}
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
                    <th className="px-3 py-2 font-semibold">Ref</th>
                    <th className="px-3 py-2 font-semibold">User</th>
                    <th className="px-3 py-2 font-semibold">Flight</th>
                    <th className="px-3 py-2 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.map((b, i) => (
                    <tr key={i} className="border-b border-[#E2DFD9] last:border-b-0 hover:bg-[#FAF8F3] transition-colors">
                      <td className="px-3 py-2.5 font-mono text-xs text-[#8E6D14]">{b.reference}</td>
                      <td className="px-3 py-2.5 text-[#1A1A18]">{b.user?.email || 'N/A'}</td>
                      <td className="px-3 py-2.5 text-[#1A1A18]">{b.flight?.flightNo || 'N/A'}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-[#0B2545]">${b.totalUsd}</td>
                    </tr>
                  ))}
                  {data.recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-[#7D7A74]">No bookings yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Secondary stats row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Vehicles', value: stats.totalVehicles },
            { label: 'Hotels', value: stats.totalHotels },
            { label: 'Attractions', value: stats.totalAttractions },
            { label: 'Tours', value: stats.totalTours },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border-2 border-dashed border-[#E2DFD9] bg-white p-4 text-center">
              <p className="text-xs text-[#7D7A74]">{stat.label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-[#0B2545]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
