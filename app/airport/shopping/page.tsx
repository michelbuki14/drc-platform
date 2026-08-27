'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

const CATS = [
  { value: 'all', label: 'All' },
  { value: 'dutyfree', label: 'Duty Free' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'essentials', label: 'Essentials' },
];
const CAT_ICON: Record<string, string> = { dutyfree: '🛍️', electronics: '📱', fashion: '👗', gifts: '🎁', beauty: '💄', essentials: '🧴' };

interface Shop { id: string; name: string; category: string; level: string | null; hours: string | null; }

export default function AirportShoppingPage() {
  const { t } = useI18n();
  const [shops, setShops] = useState<Shop[]>([]);
  const [cat, setCat] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/airport/shops?airportId=apt_fih');
        if (res.ok) setShops((await res.json()).data || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = cat === 'all' ? shops : shops.filter((s: Shop) => s.category === cat);

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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Airport Shopping</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {CATS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCat(c.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                cat === c.value
                  ? 'bg-[#0B2545] text-white shadow-sm'
                  : 'bg-[#F1EDE7] text-[#7D7A74] border border-[#E2DFD9] hover:bg-white hover:border-[#0B2545]/20'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="animate-pulse rounded-xl border border-[#E2DFD9] bg-white h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(s => (
              <div
                key={s.id}
                className="group flex flex-col gap-2 rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md hover:border-[#0B2545]/20 transition-all duration-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B2545]/5 text-2xl transition-transform duration-200 group-hover:scale-110">
                  {CAT_ICON[s.category] || '🛍️'}
                </div>
                <p className="font-display text-sm font-bold text-[#0B2545]">{s.name}</p>
                <p className="text-xs text-[#7D7A74] capitalize">
                  {s.category} · {s.level}
                  {s.hours ? ` · ${s.hours}` : ''}
                </p>
                <button
                  className="mt-1 w-full rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C5A02E] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-[#B8962F] hover:to-[#A88528] disabled:opacity-40"
                >
                  Pre-order
                </button>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="rounded-2xl border-2 border-dashed border-[#E2DFD9] bg-white/50 p-8 text-center">
            <p className="text-sm text-[#7D7A74]">No shops in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
