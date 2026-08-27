'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Rental { id: string; company: string; vehicleClass: string; model: string; dailyRateUsd: number; available: number; }
interface Booking { id: string; rentalId: string; totalUsd: number; status: string; pickupAt: string; }

export default function AirportCarRentalsPage() {
  const { t } = useI18n();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [pickup, setPickup] = useState('');
  const [ret, setRet] = useState('');
  const [booking, setBooking] = useState(false);
  const [userId] = useState('usr_test001');

  const load = useCallback(async () => {
    const [r, b] = await Promise.all([
      fetch('/api/airport/car-rentals?airportId=apt_fih').then(r => r.ok ? r.json() : { data: [] }),
      fetch(`/api/airport/car-rentals?userId=${userId}`).then(r => r.ok ? r.json() : { data: [] }),
    ]);
    setRentals(r.data || []);
    setBookings(b.data || []);
    if (!sel && (r.data || [])[0]) setSel((r.data as Rental[])[0].id);
  }, [userId, sel]);
  useEffect(() => { load(); }, [load]);

  const reserve = async () => {
    if (!sel || !pickup || !ret) return;
    setBooking(true);
    try {
      await fetch('/api/airport/car-rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rentalId: sel, pickupAt: pickup, returnAt: ret, flightNo: null }),
      });
      setPickup(''); setRet(''); await load();
    } finally { setBooking(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[var(--max-width-content)] items-center justify-between px-4 py-3">
          <Link href="/airport" className="flex items-center gap-1.5 text-sm text-[#7D7A74] hover:text-[#0B2545] transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Airport
          </Link>
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Car Rentals</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <h2 className="mb-4 text-sm font-display font-bold text-[#0B2545]">Available Vehicles</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rentals.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSel(r.id)}
              className={`group flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                sel === r.id
                  ? 'border-[#0B2545] bg-[#0B2545]/5 shadow-[0_4px_12px_rgba(11,37,69,0.12)]'
                  : 'border-[#E2DFD9] bg-white hover:border-[#0B2545]/[0.12] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
              }`}
            >
              <p className="text-xs font-medium text-[#7D7A74]">{r.company} · {r.vehicleClass}</p>
              <p className="font-display text-sm font-bold text-[#0B2545]">{r.model}</p>
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-bold text-[#0B2545]">${r.dailyRateUsd}<span className="text-xs font-normal text-[#7D7A74]">/day</span></p>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  r.available > 5 ? 'bg-[#E8F3EC] text-[#1B4D2E]'
                    : r.available > 0 ? 'bg-[#FEF3C7] text-[#9A5B3C]'
                    : 'bg-[#FEE2E2] text-[#B91C1C]'
                }`}>
                  {r.available}
                </div>
              </div>
              <p className="text-xs text-[#7D7A74]">{r.available} available</p>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <input
              type="datetime-local"
              value={pickup}
              onChange={e => setPickup(e.target.value)}
              className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
            />
          </div>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <input
              type="datetime-local"
              value={ret}
              onChange={e => setRet(e.target.value)}
              className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              placeholder="Return date"
            />
          </div>
        </div>
        <button
          onClick={reserve}
          disabled={booking || !sel}
          className="mt-4 w-full rounded-xl bg-[#0B2545] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {booking ? 'Reserving…' : 'Reserve'}
        </button>

        {bookings.length > 0 && (
          <>
            <h2 className="mt-6 mb-4 text-sm font-display font-bold text-[#0B2545]">Your Rentals</h2>
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div>
                    <p className="font-display text-sm font-bold text-[#0B2545]">${b.totalUsd} · {new Date(b.pickupAt).toLocaleDateString()}</p>
                    <p className="text-xs text-[#7D7A74]">Digital confirmation sent</p>
                  </div>
                  <span className="rounded-full bg-[#E8F3EC] px-2.5 py-0.5 text-xs font-semibold text-[#1B4D2E]">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
