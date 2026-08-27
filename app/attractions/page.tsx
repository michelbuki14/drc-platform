'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Attraction {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  category: string;
  highlights?: string[];
  priceUsd?: number;
}

export default function AttractionsPage() {
  const { t } = useI18n();
  const params = useParams();
  const [data, setData] = useState<{ attractions?: Attraction[]; attraction?: Attraction } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string | undefined;
    const url = id ? `/api/attractions/${id}` : '/api/attractions';
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        setData(
          json.attractions ? { attractions: json.attractions } : { attraction: json.attraction }
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FAF8F3]">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E2DFD9] border-t-[#D4AF37]" />
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3 text-sm text-[#7D7A74]">{t('loading') || 'Loading...'}</p>
      </div>
    );
  }

  const single = data?.attraction;
  const list = data?.attractions;

  if (single) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 bg-[#FAF8F3]">
        <div className="rounded-2xl border border-[#E2DFD9] bg-white p-8 sm:p-10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="label text-[#D4AF37]">
            {single.city}, {single.country}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
            {single.name}
          </h1>

          <p className="mt-4 leading-relaxed text-[#7D7A74] text-lg">
            {single.description}
          </p>

          {single.highlights && (
            <div className="mt-6">
              <h2 className="label text-[#7D7A74]">Highlights</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {single.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A18]">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {single.priceUsd != null && (
            <div className="mt-6 rounded-xl border border-[#E2DFD9] bg-#[FAF8F3]/60 p-4">
              <p className="text-sm text-[#7D7A74]">Starting from</p>
              <p className="mt-1 font-display text-2xl font-bold text-[#D4AF37]">${single.priceUsd}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/attractions/${single.id}/book`}
              className="inline-flex items-center gap-2 rounded-full bg-[#0B2545] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20"
            >
              Book Now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/attractions"
              className="inline-flex items-center gap-2 rounded-full border border-[#E2DFD9] px-6 py-2.5 text-sm font-semibold text-[#7D7A74] transition-all duration-200 hover:bg-[#FAF8F3] hover:text-[#1A1A18]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mx-auto h-1 w-24 rounded-full bg-[#D4AF37] mb-3" />
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
          {t('attractions.title') || 'Attractions'}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#7D7A74]">
          {t('attractions.desc') || 'Discover the hidden gems, cultural landmarks, and natural wonders of the Democratic Republic of the Congo.'}
        </p>
      </div>

      {(!list || list.length === 0) ? (
        <div className="mx-auto max-w-lg text-center py-16">
          <svg className="mx-auto h-14 w-14 text-[#7D7A74]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.00 9.00 0 0 0 9-9m-6 6a6 6 0 1 1 12 0m-6 6V9m-3 3h6m-6 3v6" />
          </svg>
          <h2 className="mt-4 font-display text-lg font-bold text-[#0B2545]">
            {t('attractions.empty') || `Explore what's available`}
          </h2>
          <p className="mt-2 text-sm text-[#7D7A74]">
            {t('attractions.emptyDesc') || "We're adding new attractions across the DRC. Check back soon!"}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0B2545] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <Link
              key={a.id}
              href={`/attractions/${a.id}`}
              className="group relative block rounded-2xl border border-[#E2DFD9] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D4AF37]/[0.3] hover:shadow-[0_8px_24px_rgba(212,175,55,0.08)] hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 1 1 1.1 13.182l3.11 3.11a1 1 0 0 1-1.1 1.1H12.82a1 1 0 0 1-1.1-1.1l3.11-3.11a7 7 0 0 1 1.1-13.182zm-1.02 1.02a1 1 0 1 0 1.414 1.414L10 13.414V7.414a1 1 0 0 0-2 0v6l-4.243 4.243a1 1 0 0 0 1.414 1.414h3.586z"
                    clipRule="evenodd"
                  />
                </svg>
                {a.category}
              </div>

              <h3 className="mt-3 font-display text-xl font-bold text-[#0B2545] group-hover:text-[#D4AF37] transition-colors duration-200">
                {a.name}
              </h3>

              <p className="mt-1 text-sm text-[#7D7A74]">
                {a.city}, {a.country}
              </p>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#7D7A74]">
                {a.description}
              </p>

              {a.priceUsd != null && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FAF8F3] px-3.5 py-2">
                  <span className="text-xs text-[#7D7A74]">From</span>
                  <span className="text-sm font-semibold text-[#D4AF37]">${a.priceUsd}</span>
                </div>
              )}

              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#0B2545] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {t('attractions.viewDetails') || 'View Details'}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
