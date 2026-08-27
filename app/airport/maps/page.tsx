'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  gate: 'Gates', security: 'Security', immigration: 'Immigration', customs: 'Customs',
  restaurant: 'Restaurants', cafe: 'Cafés', bar: 'Bars', dutyfree: 'Duty Free',
  lounge: 'Lounges', pray: 'Prayer Rooms', restroom: 'Restrooms', elevator: 'Elevators',
  escalator: 'Escalators', charging: 'Charging', exchange: 'Exchange', atm: 'ATMs',
  info: 'Info Desks', medical: 'Medical', lostfound: 'Lost & Found', taxi: 'Taxi',
  rideshare: 'Ride-share', carrental: 'Car Rental', parking: 'Parking', wifi: 'Wi-Fi',
  police: 'Police', embassy: 'Embassy',
};
const CATEGORY_ICONS: Record<string, string> = {
  gate: '🚪', security: '🛂', immigration: '📋', customs: '🧳', restaurant: '🍽️',
  cafe: '☕', bar: '🍸', dutyfree: '🛍️', lounge: '🛋️', pray: '🕌', restroom: '🚻',
  elevator: '🛗', escalator: '🪜', charging: '🔌', exchange: '💱', atm: '🏧',
  info: 'ℹ️', medical: '⚕️', lostfound: '🔎', taxi: '🚕', rideshare: '🚗',
  carrental: '🚙', parking: '🅿️', wifi: '📶', police: '👮', embassy: '🏛️',
};

interface POI { id: string; category: string; name: string; level: string | null; hours: string | null; }

export default function AirportMapsPage() {
  const { t } = useI18n();
  const [pois, setPois] = useState<POI[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/airport/pois?airportId=apt_fih');
        if (res.ok) setPois((await res.json()).data || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const grouped = pois.reduce<Record<string, POI[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  const filtered = Object.entries(grouped).filter(([cat, items]) =>
    cat.toLowerCase().includes(query.toLowerCase()) ||
    items.some(i => i.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[var(--max-width-content)] items-center justify-between px-4 py-3">
          <Link href="/airport" className="flex items-center gap-1.5 text-sm text-[#7D7A74] hover:text-[#0B2545] transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Airport
          </Link>
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Airport Maps</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        {/* Search */}
        <div className="relative">
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search gates, lounges, restaurants…"
            className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="animate-pulse rounded-xl bg-white border border-[#E2DFD9] h-12" />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {filtered.map(([cat, items]) => (
              <section key={cat}>
                <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#7D7A74]">
                  <span className="text-lg">{CATEGORY_ICONS[cat] || '📍'}</span>
                  {CATEGORY_LABELS[cat] || cat}
                  <span className="ml-auto text-[#7D7A74]">{items.length}</span>
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map(p => (
                    <div key={p.id} className="group flex items-center gap-3 rounded-xl border border-[#E2DFD9] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#0B2545]/[0.12] transition-all duration-200">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B2545]/5 text-lg transition-transform duration-200 group-hover:scale-110">
                        {CATEGORY_ICONS[p.category] || '📍'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#0B2545] truncate">{p.name}</p>
                        <p className="text-xs text-[#7D7A74]">{p.level}{p.hours ? ` · ${p.hours}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[#7D7A74]">
          Turn-by-turn indoor navigation activates when live airport mapping data is available.
        </p>
      </div>
    </div>
  );
}
