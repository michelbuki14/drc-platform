'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

const HOTELS = [
  { id: 'h1', name: 'Pullman Kinshasa Grand Hôtel', type: 'Airport Hotel', dist: '2.1 km', shuttle: true, dayUse: true, price: 180 },
  { id: 'h2', name: 'Hôtel Béryl', type: 'Transit Hotel', dist: '3.5 km', shuttle: true, dayUse: true, price: 95 },
  { id: 'h3', name: 'Memling Hotel', type: 'City Hotel', dist: '18 km', shuttle: false, dayUse: false, price: 140 },
  { id: 'h4', name: 'Airport Day-Use Lounge', type: 'Day-Use', dist: 'On-site', shuttle: true, dayUse: true, price: 45 },
];

export default function AirportHotelsPage() {
  const { t } = useI18n();
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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Airport Hotels</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <h2 className="mb-4 text-sm font-display font-bold text-[#0B2545]">Nearby Accommodation</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HOTELS.map(h => (
            <div
              key={h.id}
              className="group flex flex-col gap-3 rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md hover:border-[#0B2545]/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-sm font-bold text-[#0B2545]">{h.name}</p>
                  <p className="text-xs text-[#7D7A74]">{h.type} · {h.dist}</p>
                </div>
                <p className="font-display text-lg font-bold text-[#0B2545]">${h.price}<span className="text-xs font-normal text-[#7D7A74]">/night</span></p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {h.shuttle && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F3EC] px-2 py-0.5 text-xs font-medium text-[#1B4D2E]">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M1 3h15v13H1zM16 8h4l3 3v3h-7V8z" />
                    </svg>
                    Shuttle
                  </span>
                )}
                {h.dayUse && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#9A5B3C]">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    Day-use
                  </span>
                )}
              </div>
              <Link
                href="/hotels"
                className="mt-auto w-full rounded-lg bg-[#0B2545] px-4 py-2 text-center text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#081A33] hover:shadow-md disabled:opacity-40"
              >
                Book
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
