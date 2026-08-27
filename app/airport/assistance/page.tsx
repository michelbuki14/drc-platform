'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

const SERVICES = [
  { value: 'meet_assist', label: 'Meet & Assist', icon: '🤝', desc: 'Personal greeting and guidance' },
  { value: 'fast_track', label: 'Fast Track', icon: '⚡', desc: 'Priority security & immigration' },
  { value: 'vip', label: 'VIP Service', icon: '👑', desc: 'Full premium handling' },
  { value: 'porter', label: 'Porter', icon: '🧳', desc: 'Luggage assistance' },
  { value: 'wheelchair', label: 'Wheelchair', icon: '♿', desc: 'Mobility assistance' },
  { value: 'elderly', label: 'Elderly Assistance', icon: '🧓', desc: 'Supported travel' },
  { value: 'child', label: 'Child Assistance', icon: '🧒', desc: 'Unaccompanied minor support' },
  { value: 'interpreter', label: 'Interpreter', icon: '🗣️', desc: 'Language support' },
  { value: 'business_concierge', label: 'Business Concierge', icon: '💼', desc: 'Executive services' },
  { value: 'escort', label: 'Airport Escort', icon: '🚶', desc: 'Guided transit' },
  { value: 'personal_assistant', label: 'Personal Assistant', icon: '🤖', desc: 'Dedicated help' },
  { value: 'translation', label: 'Translation', icon: '🌐', desc: 'Document & verbal' },
  { value: 'shopping', label: 'Shopping Assistance', icon: '🛍️', desc: 'Personal shopper' },
];
const PRICE: Record<string, number> = { meet_assist: 40, fast_track: 35, vip: 150, porter: 20, wheelchair: 25, elderly: 30, child: 30, interpreter: 50, business_concierge: 120, escort: 45, personal_assistant: 100, translation: 45, shopping: 40 };

interface Req { id: string; type: string; status: string; partySize: number; priceUsd: number; }

export default function AirportAssistancePage() {
  const { t } = useI18n();
  const [type, setType] = useState('meet_assist');
  const [flightNo, setFlightNo] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Req[]>([]);
  const [booking, setBooking] = useState(false);
  const [userId] = useState('usr_test001');

  const load = useCallback(async () => {
    const res = await fetch(`/api/airport/assistance?userId=${userId}`);
    if (res.ok) setItems((await res.json()).data || []);
  }, [userId]);
  useEffect(() => { load(); }, [load]);

  const book = async () => {
    setBooking(true);
    try {
      const res = await fetch('/api/airport/assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, airportId: 'apt_fih', type, flightNo: flightNo || null, partySize: parseInt(partySize) || 1, notes: notes || null }),
      });
      if (res.ok) { setFlightNo(''); setNotes(''); await load(); }
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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Passenger Assistance</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <h2 className="mb-4 text-sm font-display font-bold text-[#0B2545]">Request a Service</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setType(s.value)}
              className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all duration-200 ${
                type === s.value
                  ? 'border-[#0B2545] bg-[#0B2545]/5 shadow-[0_4px_12px_rgba(11,37,69,0.12)]'
                  : 'border-[#E2DFD9] bg-white hover:border-[#0B2545]/[0.12] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-colors duration-200 ${
                type === s.value ? 'bg-[#0B2545] text-white' : 'bg-[#0B2545]/5 text-[#0B2545] group-hover:bg-[#0B2545]/10'
              }`}>
                {s.icon}
              </div>
              <p className="font-display text-sm font-bold text-[#0B2545]">{s.label}</p>
              <p className="text-xs text-[#7D7A74]">{s.desc}</p>
              <p className={`text-sm font-bold ${
                type === s.value ? 'text-[#D4AF37]' : 'text-[#0B2545]'
              }`}>${PRICE[s.value]}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input value={flightNo} onChange={e => setFlightNo(e.target.value)} placeholder="Flight No (optional)" className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all" />
          </div>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <input value={partySize} onChange={e => setPartySize(e.target.value)} type="number" min={1} placeholder="Party size" className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all" />
          </div>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special notes" className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all" />
          </div>
        </div>
        <button
          onClick={book}
          disabled={booking}
          className="mt-4 w-full rounded-xl bg-[#0B2545] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {booking ? 'Requesting…' : `Request · $${PRICE[type]}`}
        </button>

        <h2 className="mt-6 mb-4 text-sm font-display font-bold text-[#0B2545]">Your Requests</h2>
        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#E2DFD9] bg-white/50 p-6 text-center">
            <p className="text-sm text-[#7D7A74]">No requests yet. Partner providers will manage and confirm these.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(it => (
              <div key={it.id} className="flex items-center justify-between rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="font-display text-sm font-bold text-[#0B2545] capitalize">{it.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-[#7D7A74]">Party: {it.partySize} · ${it.priceUsd}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  it.status === 'completed' ? 'bg-[#E8F3EC] text-[#1B4D2E]'
                  : 'bg-[#FEF3C7] text-[#9A5B3C]'
                }`}>
                  {it.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
