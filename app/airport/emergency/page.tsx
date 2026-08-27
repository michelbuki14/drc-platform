'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

const EMERGENCY_ICONS: Record<string, string> = { police: '👮', medical: '⚕️', fire: '🚒', lostfound: '🔎', embassy: '🏛️', airline: '✈️' };

interface Contact { id: string; category: string; name: string; phone: string | null; details: string | null; }

export default function AirportEmergencyPage() {
  const { t } = useI18n();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/airport/emergency?airportId=apt_fih');
        if (res.ok) setContacts((await res.json()).data || []);
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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Emergency Services</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] p-6 text-center shadow-inner">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B91C1C]/10 text-2xl">
              🚨
            </div>
          </div>
          <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#B91C1C]">General Emergency</p>
          <a href="tel:112" className="mt-2 inline-block">
            <span className="text-5xl font-display font-bold text-[#B91C1C] tracking-tight">112</span>
          </a>
          <p className="mt-1 text-xs text-[#7D7A74]">Police · Medical · Fire — available 24/7</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="animate-pulse rounded-xl border border-[#E2DFD9] bg-white h-14" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map(c => (
              <a
                key={c.id}
                href={c.phone ? `tel:${c.phone}` : undefined}
                className="flex items-center gap-3 rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md hover:border-[#B91C1C]/30 transition-all duration-200 group"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors duration-200 ${
                  c.category === 'police' ? 'bg-[#E8F3EC] text-[#1B4D2E] group-hover:bg-[#1B4D2E]/10'
                    : c.category === 'medical' ? 'bg-[#FEE2E2] text-[#B91C1C] group-hover:bg-[#B91C1C]/10'
                    : c.category === 'fire' ? 'bg-[#FEE2E2] text-[#B91C1C] group-hover:bg-[#B91C1C]/10'
                    : 'bg-[#FAF8F3] text-[#0B2545] group-hover:bg-[#0B2545]/10'
                }`}>
                  {EMERGENCY_ICONS[c.category] || '📞'}
                </div>
                <div className="flex-1">
                  <p className="font-display text-sm font-bold text-[#0B2545]">{c.name}</p>
                  <p className="text-xs text-[#7D7A74]">{c.details}</p>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-[#7D7A74] transition-colors group-hover:text-[#B91C1C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="text-sm font-bold text-[#0B2545]">{c.phone}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-[#E2DFD9] bg-white/50 p-4 text-center">
          <p className="text-xs text-[#7D7A74]">
            In case of emergency at FIH Airport, dial <strong className="text-[#B91C1C]">112</strong> or contact airport security at the nearest information desk.
          </p>
        </div>
      </div>
    </div>
  );
}
