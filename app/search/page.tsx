'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Result { type: string; id: string; title: string; subtitle: string; price?: number; href: string; image?: string | null; rating?: number | null; }

export default function SearchPage() {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('price');
  const [order, setOrder] = useState('asc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Result[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 12;

  const run = async (nextPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      params.set('type', type);
      params.set('sort', sort);
      params.set('order', order);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('page', String(nextPage));
      params.set('pageSize', String(pageSize));
      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setResults(d.data || []);
        setTotal(d.total || 0);
        setPage(nextPage);
      }
    } finally { setLoading(false); }
  };

  // Debounced search on text/type change
  useEffect(() => {
    const to = setTimeout(() => { setPage(1); run(1); }, 250);
    return () => clearTimeout(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  const TYPES = [
    { value: 'all', label: 'All' },
    { value: 'flights', label: 'Flights' },
    { value: 'hotels', label: 'Hotels' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'tours', label: 'Tours' },
    { value: 'cargo', label: 'Cargo' },
    { value: 'services', label: 'Services' },
  ];
  const ICON: Record<string, string> = { flights: '✈️', hotels: '🏨', vehicles: '🚗', tours: '🗺️', cargo: '📦', services: '🤝' };
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[var(--max-width-content)] items-center justify-between px-4 py-3">
          <Link href="/" className="btn-ghost text-xs">← Home</Link>
          <h1 className="text-sm font-semibold text-[var(--color-text)]">Search</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-20">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">🔍</span>
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search flights, hotels, vehicles, tours, cargo…"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-4 pl-12 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {TYPES.map(ty => (
            <button key={ty.value} type="button" onClick={() => setType(ty.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${type === ty.value ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]'}`}>
              {ty.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input type="number" min={0} placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            className="input" />
          <input type="number" min={0} placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            className="input" />
          <select value={sort} onChange={e => setSort(e.target.value)} className="input">
            <option value="price">Sort: Price</option>
            <option value="name">Sort: Name</option>
            <option value="rating">Sort: Rating</option>
          </select>
          <select value={order} onChange={e => setOrder(e.target.value)} className="input">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <button onClick={() => run(1)} className="btn-primary mt-2 w-full py-2 text-sm font-semibold">Apply filters</button>

        <div className="mt-5">
          {loading && <div className="animate-pulse h-24 rounded-xl bg-[var(--color-surface)]" />}
          {!loading && total > 0 && (
            <p className="mb-2 text-xs text-[var(--color-text-muted)]">{total} result{total === 1 ? '' : 's'} · page {page}/{totalPages}</p>
          )}
          {!loading && q && total === 0 && (
            <p className="text-sm text-[var(--color-text-muted)]">No results for “{q}”.</p>
          )}
          {!q && !loading && (
            <p className="text-sm text-[var(--color-text-muted)]">Start typing to search across CongoConnect.</p>
          )}
          <div className="space-y-2">
            {results.map(r => (
              <Link key={`${r.type}-${r.id}`} href={r.href}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 transition hover:border-[var(--color-primary)]">
                <span className="text-xl">{ICON[r.type] || '🔎'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text)]">{r.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {r.subtitle}{r.rating != null ? ` · ★ ${r.rating}` : ''}
                  </p>
                </div>
                {r.price != null && <span className="text-sm font-bold text-[var(--color-primary)]">${r.price}</span>}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => run(page - 1)} className="btn-ghost-outline px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-[var(--color-text-muted)]">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => run(page + 1)} className="btn-ghost-outline px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
