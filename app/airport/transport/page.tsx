'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

const TYPES = [
  { value: 'pickup', label: 'Airport Pickup', icon: '🚕', desc: 'Driver meets you at arrivals' },
  { value: 'dropoff', label: 'Airport Drop-off', icon: '🚙', desc: 'Ride to the terminal' },
  { value: 'private', label: 'Private Driver', icon: '🚐', desc: 'Dedicated chauffeur' },
  { value: 'luxury', label: 'Luxury Vehicle', icon: '🏎️', desc: 'Premium experience' },
  { value: 'shuttle', label: 'Shared Shuttle', icon: '🚌', desc: 'Cost-effective shared ride' },
  { value: 'business', label: 'Business Transport', icon: '💼', desc: 'Corporate travel' },
  { value: 'family', label: 'Family Vehicle', icon: '👨‍👩‍👧', desc: 'Child seats available' },
];
const CLASS_PRICE: Record<string, number> = { pickup: 25, dropoff: 22, private: 60, luxury: 120, shuttle: 15, business: 90, family: 70 };

interface Transfer { id: string; type: string; status: string; flightNo: string | null; priceUsd: number; etaMin: number | null; driverName: string | null; }

export default function AirportTransportPage() {
  const { t } = useI18n();
  const [type, setType] = useState('pickup');
  const [flightNo, setFlightNo] = useState('');
  const [address, setAddress] = useState('');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [booking, setBooking] = useState(false);
  const [userId] = useState('usr_test001');

  const load = useCallback(async () => {
    const res = await fetch(`/api/airport/transfers?userId=${userId}`);
    if (res.ok) setTransfers((await res.json()).data || []);
  }, [userId]);
  useEffect(() => { load(); }, [load]);

  const book = async () => {
    setBooking(true);
    try {
      const res = await fetch('/api/airport/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, airportId: 'apt_fih', type, flightNo: flightNo || null, address: address || null }),
      });
      if (res.ok) { setFlightNo(''); setAddress(''); await load(); }
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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Airport Transportation</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <h2 className="mb-4 text-sm font-display font-bold text-[#0B2545]">Book a Ride</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map(ty => (
            <button
              key={ty.value}
              type="button"
              onClick={() => setType(ty.value)}
              className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all duration-200 ${
                type === ty.value
                  ? 'border-[#0B2545] bg-[#0B2545]/5 shadow-[0_4px_12px_rgba(11,37,69,0.12)]'
                  : 'border-[#E2DFD9] bg-white hover:border-[#0B2545]/[0.12] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-colors duration-200 ${
                type === ty.value ? 'bg-[#0B2545] text-white' : 'bg-[#0B2545]/5 text-[#0B2545] group-hover:bg-[#0B2545]/10'
              }`}>
                {ty.icon}
              </div>
              <p className="font-display text-sm font-bold text-[#0B2545]">{ty.label}</p>
              <p className="text-xs text-[#7D7A74]">{ty.desc}</p>
              <p className={`text-sm font-bold ${
                type === ty.value ? 'text-[#D4AF37]' : 'text-[#0B2545]'
              }`}>${CLASS_PRICE[ty.value]}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input value={flightNo} onChange={e => setFlightNo(e.target.value)} placeholder="Flight No (optional)" className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all" />
          </div>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Pickup address (optional)" className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all" />
          </div>
        </div>
        <button
          onClick={book}
          disabled={booking}
          className="mt-4 w-full rounded-xl bg-[#0B2545] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {booking ? 'Booking…' : `Book ${type} · $${CLASS_PRICE[type]}`}
        </button>

        <h2 className="mt-6 mb-4 text-sm font-display font-bold text-[#0B2545]">Your Rides</h2>
        {transfers.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#E2DFD9] bg-white/50 p-6 text-center">
            <p className="text-sm text-[#7D7A74]">No rides booked yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transfers.map(tr => (
              <div key={tr.id} className="flex items-center justify-between rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="font-display text-sm font-bold text-[#0B2545] capitalize">
                    {tr.type.replace('_', ' ')}{tr.flightNo ? ` · ${tr.flightNo}` : ''}
                  </p>
                  <p className="text-xs text-[#7D7A74]">
                    {tr.driverName ? `Driver: ${tr.driverName}` : 'Awaiting driver assignment'}
                    {tr.etaMin ? ` · ETA ${tr.etaMin}m` : ''}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  tr.status === 'completed' ? 'bg-[#E8F3EC] text-[#1B4D2E]'
                  : 'bg-[#FEF3C7] text-[#9A5B3C]'
                }`}>
                  {tr.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
