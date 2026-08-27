'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  description: string;
  origin: string;
  destination: string;
  originalPriceUsd: number;
  dealPriceUsd: number;
  validFrom: string;
  validTo: string;
}

function DealCard({deal}: {deal: Deal}) {
  const savings = deal.originalPriceUsd - deal.dealPriceUsd;
  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-warning)]">Flash Deal</p>
          <h3 className="mt-1 text-sm font-bold text-[var(--color-text)]">{deal.title}</h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{deal.origin} → {deal.destination}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text)]">{deal.description}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-xl font-bold text-[var(--color-error)] line-through">${deal.originalPriceUsd.toFixed(2)}</span>
        <span className="text-xl font-bold text-[var(--color-primary)]">${deal.dealPriceUsd.toFixed(2)}</span>
      </div>
      <p className="mt-1 text-xs text-[var(--color-success)] font-medium">Save ${savings.toFixed(2)} ({Math.round(savings / deal.originalPriceUsd * 100)}% off)</p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        Valid: {new Date(deal.validFrom).toLocaleDateString()} → {new Date(deal.validTo).toLocaleDateString()}
      </p>
      <button className="mt-3 w-full btn-primary text-xs">Book Deal</button>
    </div>
  );
}

export default function DealsPage() {
  const { t } = useI18n();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/deals')
      .then((r) => r.json())
      .then((data) => setDeals(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">C</span>
                <span className="text-base font-bold text-[var(--color-primary)]">Congo<span className="text-[var(--color-accent)]">Connect</span></span>
              </Link>
              <span className="text-sm text-[var(--color-text-muted)]">Flash Deals</span>
            </div>
            <Link href="/" className="btn-ghost text-xs">← Home</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Today's Flash Deals</h1>
          <span className="rounded-full bg-[var(--color-warning)]/20 px-3 py-1 text-xs font-semibold text-[var(--color-warning)]">
            {deals.length} active
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/>
          </div>
        ) : deals.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/5">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--color-text)]">No flash deals right now</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Check back later for time-limited offers</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((d) => <DealCard key={d.id} deal={d}/>)}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--color-text)]">Enable price alerts to catch deals automatically</p>
          <Link href="/price-alerts" className="mt-2 btn-gold-outline text-sm inline-block">
            Manage Price Alerts →
          </Link>
        </div>
      </div>
    </div>
  );
}
