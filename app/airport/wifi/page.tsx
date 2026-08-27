'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Wifi { id: string; ssid: string; instructions: string | null; timeLimitMin: number | null; notes: string | null; }

export default function AirportWifiPage() {
  const { t } = useI18n();
  const [wifi, setWifi] = useState<Wifi[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/airport/wifi?airportId=apt_fih');
        if (res.ok) setWifi((await res.json()).data || []);
      } finally { setLoading(false); }
    })();
  }, []);

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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Airport Wi-Fi</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <div className="mb-4 rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2545]/10 text-2xl">
              📶
            </div>
            <div>
              <p className="font-display text-sm font-bold text-[#0B2545]">CongoConnect-Free</p>
              <p className="text-xs text-[#7D7A74]">Free Wi-Fi for all passengers at FIH Airport</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(n => (
              <div key={n} className="animate-pulse rounded-xl border border-[#E2DFD9] bg-white h-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {wifi.map(w => (
              <div key={w.id} className="rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2545]/5 text-xl">
                    📶
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold text-[#0B2545]">{w.ssid}</p>
                    {w.instructions && (
                      <p className="text-xs text-[#7D7A74]">{w.instructions}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#7D7A74]">
                  {w.timeLimitMin ? (
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {w.timeLimitMin} min limit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Unlimited
                    </span>
                  )}
                  {w.notes && <span>{w.notes}</span>}
                </div>
                <button
                  onClick={() => {
                    try { navigator.clipboard.writeText(w.ssid); } catch {}
                  }}
                  className="mt-3 w-full rounded-lg bg-[#0B2545] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#081A33] hover:shadow-md"
                >
                  Copy Network Name
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
