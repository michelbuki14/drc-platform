'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

const TYPES = [
  { value: 'track', label: 'Track Baggage', icon: '📍' },
  { value: 'extra', label: 'Buy Extra Baggage', icon: '➕', price: 50 },
  { value: 'report_delayed', label: 'Report Delayed Baggage', icon: '⏳' },
  { value: 'report_lost', label: 'Report Lost Baggage', icon: '🔎' },
  { value: 'claim_location', label: 'Baggage Claim Area', icon: '🧳' },
];

interface Svc { id: string; type: string; status: string; description: string | null; claimArea: string | null; priceUsd: number; }

export default function AirportBaggagePage() {
  const { t } = useI18n();
  const [type, setType] = useState('track');
  const [flightNo, setFlightNo] = useState('CC-101');
  const [desc, setDesc] = useState('');
  const [claimArea, setClaimArea] = useState('');
  const [services, setServices] = useState<Svc[]>([]);
  const [allowance, setAllowance] = useState<any[]>([]);
  const [booking, setBooking] = useState(false);
  const [userId] = useState('usr_test001');

  const load = useCallback(async () => {
    const [s, a] = await Promise.all([
      fetch(`/api/airport/baggage?userId=${userId}`).then(r => r.ok ? r.json() : { data: [] }),
      fetch(`/api/airport/baggage?flightNo=${flightNo}`).then(r => r.ok ? r.json() : { data: { allowance: [] } }),
    ]);
    setServices(s.data || []);
    setAllowance(a.data?.allowance || []);
  }, [userId, flightNo]);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setBooking(true);
    try {
      await fetch('/api/airport/baggage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, flightNo, type, description: desc || null, claimArea: claimArea || null }),
      });
      setDesc(''); setClaimArea(''); await load();
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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Baggage Services</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-[#7D7A74]">Flight Number</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <input value={flightNo} onChange={e => setFlightNo(e.target.value)} className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all" />
          </div>
        </div>

        {allowance.length > 0 && (
          <div className="mb-4 rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm">
            <p className="text-xs font-display font-bold uppercase tracking-widest text-[#7D7A74]">Baggage Allowance</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {allowance.map((a: any) => (
                <div key={a.id} className="rounded-lg bg-[#FAF8F3] p-3 text-center">
                  <p className="text-xs text-[#7D7A74]">{a.cabinClass}</p>
                  <p className="text-sm font-display font-bold text-[#0B2545]">{a.freeCheckedKg}kg</p>
                  <p className="text-xs text-[#7D7A74]">{a.freeCarryOn} carry-on · ${a.excessFeeUsd} excess</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-3 text-sm font-display font-bold text-[#0B2545]">Request Service</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TYPES.map(ty => (
            <button
              key={ty.value}
              type="button"
              onClick={() => setType(ty.value)}
              className={`rounded-xl border-2 p-3 text-center text-sm font-display transition-all duration-200 ${
                type === ty.value
                  ? 'border-[#0B2545] bg-[#0B2545]/5 font-bold text-[#0B2545]'
                  : 'border-[#E2DFD9] bg-white text-[#7D7A74] hover:border-[#0B2545]/[0.12]'
              }`}
            >
              <span className="mr-1.5 text-base">{ty.icon}</span>{ty.label}
            </button>
          ))}
        </div>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Description (for delayed/lost reports)"
          className="mt-3 w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
          rows={2}
        />
        <div className="mt-2 relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <input value={claimArea} onChange={e => setClaimArea(e.target.value)} placeholder="Claim area / carousel (optional)" className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all" />
        </div>
        <button
          onClick={submit}
          disabled={booking}
          className="mt-4 w-full rounded-xl bg-[#0B2545] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {booking ? 'Submitting…' : 'Submit Request'}
        </button>

        <h2 className="mt-6 mb-4 text-sm font-display font-bold text-[#0B2545]">Your Requests</h2>
        {services.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#E2DFD9] bg-white/50 p-6 text-center">
            <p className="text-sm text-[#7D7A74]">No baggage requests.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="font-display text-sm font-bold text-[#0B2545] capitalize">
                    {s.type.replace(/_/g, ' ')}{s.claimArea ? ` · ${s.claimArea}` : ''}
                  </p>
                  {s.description && <p className="text-xs text-[#7D7A74]">{s.description}</p>}
                </div>
                <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#9A5B3C]">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
