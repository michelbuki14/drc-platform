'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

const RATES = [
  { pair: 'USD → CDF', rate: 2800, flag: '🇨🇩' },
  { pair: 'EUR → CDF', rate: 3050, flag: '🇪🇺' },
  { pair: 'USD → EUR', rate: 0.92, flag: '🇪🇺' },
];

interface Currency { id: string; type: string; name: string; level: string | null; currencies: string | null; hours: string | null; }
interface LocalT { id: string; mode: string; name: string; priceFromUsd: number; durationMin: number | null; notes: string | null; }

export default function AirportCurrencyPage() {
  const { t } = useI18n();
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState<Record<string, any>[]>([]);
  const [local, setLocal] = useState<LocalT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, l] = await Promise.all([
          fetch('/api/airport/currency?airportId=apt_fih').then(r => r.ok ? r.json() : { data: [] }),
          fetch('/api/airport/localtransport?airportId=apt_fih').then(r => r.ok ? r.json() : { data: [] }),
        ]);
        setCurrency(c.data || []);
        setLocal(l.data || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const amt = parseFloat(amount) || 0;

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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Currency & Local Transport</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <section className="mb-6 rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-[#7D7A74]">Live Exchange (indicative)</p>
          <div className="relative mt-2">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
            />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {RATES.map(r => (
              <div key={r.pair} className="rounded-lg bg-[#FAF8F3] p-3 text-center">
                <p className="text-xs text-[#7D7A74]">{r.flag} {r.pair}</p>
                <p className="text-sm font-display font-bold text-[#0B2545]">
                  {(amt * r.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </section>

        <h2 className="mb-3 text-sm font-display font-bold text-[#0B2545]">Exchange & ATMs</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {currency.map(c => (
            <div key={c.id} className="rounded-xl border border-[#E2DFD9] bg-white p-3 shadow-sm">
              <p className="font-display text-sm font-semibold text-[#0B2545] capitalize">
                {c.type}: {c.name}
              </p>
              <p className="text-xs text-[#7D7A74]">
                {c.level}
                {c.currencies ? ` · ${c.currencies}` : ''}
                {c.hours ? ` · ${c.hours}` : ''}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 mb-3 text-sm font-display font-bold text-[#0B2545]">Local Transport</h2>
        <div className="space-y-2">
          {local.map(t => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-[#E2DFD9] bg-white p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div>
                <p className="font-display text-sm font-semibold text-[#0B2545] capitalize">
                  {t.mode} · {t.name}
                </p>
                <p className="text-xs text-[#7D7A74]">
                  {t.notes}
                  {t.durationMin ? ` · ~${t.durationMin}min` : ''}
                </p>
              </div>
              <span className="font-display text-sm font-bold text-[#0B2545]">${t.priceFromUsd}+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
