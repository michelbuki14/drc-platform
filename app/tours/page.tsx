'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Tour {
  id: string;
  name: string;
  city: string;
  description: string;
  durationHours: number;
  category: string;
  language: string;
  includes: string;
  perPersonUsd: number;
  image: string;
  reviewCount: number;
  avgRating: number;
}

export default function ToursPage() {
  const { t } = useI18n();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);

  useEffect(() => {
    fetch('/api/tours')
      .then((r) => r.json())
      .then((data) => {
        const all = data.data || [];
        setTours(all);
        setFilteredTours(all);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setTours([]);
        setFilteredTours([]);
      });
  }, []);

  useEffect(() => {
    if (!filter) {
      setFilteredTours(tours);
    } else {
      const lower = filter.toLowerCase();
      setFilteredTours(
        tours.filter(
          (t) =>
            t.city.toLowerCase().includes(lower) ||
            t.category.toLowerCase().includes(lower) ||
            t.name.toLowerCase().includes(lower)
        )
      );
    }
  }, [filter, tours]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mx-auto h-1 w-24 rounded-full bg-[#D4AF37] mb-3" />
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
          {t('tours.title') || 'Tours & Activities'}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#7D7A74]">
          {t('tours.subtitle') || 'Guided experiences across the DRC — from wildlife safaris to cultural city walks.'}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 rounded-xl border border-[#E2DFD9] bg-white px-4 py-3 shadow-sm">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7D7A74]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 13.5 3a7.5 7.5 0 0 0 7.5 7.5Z"
            />
          </svg>
          <input
            type="text"
            placeholder={t('tours.filterPlaceholder') || 'Filter by city or category...'}
            className="w-full rounded-lg border-0 bg-[#FAF8F3] py-2 pl-10 pr-4 text-sm text-[#1A1A18] placeholder-[#A3A09A] ring-1 ring-[#E2DFD9] focus:border-[#0B2545] focus:outline-none focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545]" />
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-sm font-medium text-[#7D7A74]">{t('loading') || 'Loading tours...'}</p>
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="mx-auto max-w-lg text-center">
          <svg className="mx-auto h-14 w-14 text-[#7D7A74]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 13.5 3a7.5 7.5 0 0 0 7.5 7.5Z" />
          </svg>
          <h2 className="mt-4 font-display text-lg font-bold text-[#0B2545]">
            {t('tours.noResults') || 'No tours match your search'}
          </h2>
          <p className="mt-2 text-sm text-[#7D7A74]">
            {t('tours.tryAdjust') || 'Try adjusting your filters or browse all tours below.'}
          </p>
          <button
            onClick={() => setFilter('')}
            className="mt-4 rounded-full bg-[#0B2545] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#081A33] hover:shadow-md"
          >
            {t('tours.clearFilter') || 'Clear filter'}
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.id}`}
              className="group relative block rounded-2xl border border-[#E2DFD9] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D4AF37]/[0.3] hover:shadow-[0_8px_24px_rgba(212,175,55,0.08)] hover:-translate-y-0.5"
            >
              {/* Image placeholder */}
              <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-[#0B2545]/10 to-[#D4AF37]/5 flex items-center justify-center mb-4 overflow-hidden">
                <span className="text-4xl">{tour.image || '🌍'}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-display font-bold text-[#0B2545] group-hover:text-[#D4AF37] transition-colors duration-200">
                    {tour.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-[#7D7A74]">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5V6a3 3 0 1 0-6 0v4.5M19.5 10.5V18a3 3 0 1 0 6 0v-7.5M19.5 10.5H13.5M13.5 10.5H12m-2.25 2.25h.25a.75.75 0 0 1 .75.75v1.5a.25.25 0 0 0 .25.25h1a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-.75.75H13.5" />
                    </svg>
                    {tour.city}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#F5E7C7] px-2 py-0.5 text-xs font-medium text-[#8E6D14]">
                  {tour.category}
                </span>
              </div>

              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#7D7A74]">
                {tour.description}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs text-[#7D7A74]">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-9 9m9-9v-6h-4.5m0 0H6m0 0a9 9 0 1 0 9 9m-9-9h-4.5" />
                  </svg>
                  {tour.durationHours}h
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3m-3-3v3m-5.5 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3m-5.5 9H11" />
                  </svg>
                  {tour.language}
                </span>
                <span className="flex items-center gap-1 text-[#D4AF37]">
                  {tour.avgRating > 0 ? (
                    <>
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292c.3.921-.751 1.688-1.541 1.143l-1.243-.716c-.921-.303-1.603.751-1.143 1.541l.686 1.927c.3.921-.751 1.688-1.541 1.143l-1.243-.716c-.921-.303-1.603.751-1.143 1.541l.686 1.927c.3.921-.751 1.688-1.541 1.143l-1.243-.716c-.42-.138-.691-.533-.691-1.003v-.061c0-.508.343-.947.846-1.125l.687-1.926c.3-.921 1.603-.921 1.902 0l1.07 3.292c.3.921-.751 1.688-1.541 1.143l-.686-1.927c-.687-.354-1.541-.138-1.843.303l-1.243.716c-.3.921.751 1.688 1.143 1.541l1.243-.716c.687.354 1.541.138 1.843-.303l2.475-2.475c.3-.921 1.603-.921 1.902 0z" />
                      </svg>
                      <span className="text-xs font-medium">{tour.avgRating.toFixed(1)}</span>
                    </>
                  ) : (
                    <span className="text-xs">New</span>
                  )}
                </span>
                <span className="text-xs">({tour.reviewCount})</span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-display font-bold text-[#D4AF37]">${tour.perPersonUsd}</span>
                <span className="text-xs text-[#7D7A74]">per person</span>
              </div>

              <div className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2545]/5 px-4 py-2 text-sm font-medium text-[#0B2545] transition-all duration-200 group-hover:bg-[#0B2545]/10 group-hover:shadow-sm">
                {t('tours.viewDetails') || 'View Details'}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredTours.length > 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-[#E2DFD9] bg-[#FAF8F3]/50 p-6 text-center">
          <p className="text-sm text-[#7D7A74]">
            {filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'} available
            {' '}—{' '}
            <Link href="/tours" className="text-[#0B2545] hover:underline">
              View all
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
