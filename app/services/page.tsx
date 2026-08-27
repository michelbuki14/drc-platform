'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  priceFromUsd?: number;
  icon?: string;
  slug: string;
}

export default function ServicesPage() {
  const { t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(data => {
        setServices(data.services || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load services');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-[var(--color-accent)] border-t-transparent animate-spin"/>
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-sm font-medium text-[var(--color-text-muted)]">{t('loading') || 'Loading services...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <svg className="h-12 w-12 text-[var(--color-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75A9 9 0 1 0 12 21a9 9 0 0 0-9-9m9 9v-9"/>
        </svg>
        <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">{error}</h2>
        <Link href="/" className="mt-4 rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-primary-dark)]">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
          {t('services.title') || 'Services'}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[var(--color-text-muted)]">
          {t('services.desc') || 'On-demand services for travellers, businesses, and communities across the DRC.'}
        </p>
      </div>

      {services.length === 0 ? (
        <div className="mx-auto max-w-lg text-center">
          <svg className="mx-auto h-16 w-16 text-[var(--color-text-muted)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V21M3.75 21A2.25 2.25 0 0 1 6 18.75v-1.5"/>
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
            {t('services.empty') || 'No services available yet'}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Check back soon — we're expanding our service network across the DRC.
          </p>
          <Link
            href="/facilitation"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
            </svg>
            {t('services.viewFacilitation') || 'Explore Facilitation Services'}
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <Link
              key={service.id}
              href={`/services/book?service=${service.slug}`}
              className="group relative block rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-6 transition-all duration-200 hover:border-[var(--color-accent)]/30 hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
            >
              {/* Icon area */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.962-.565 1.8-1.079 2.494A2.25 2.25 0 0 1 5.104 8.352 2.25 2.25 0 0 0 3.25 10.5c0 1.325.74 2.468 1.693 3.156L9.75 21m0 0 .603-4.124c.251-.962.565-1.8 1.079-2.494A2.25 2.25 0 0 1 18.896 15.648 2.25 2.25 0 0 0 20.75 13.5c0-1.325-.74-2.468-1.693-3.156L14.25 3.104M14.25 3.104 9.75 21"/>
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                {service.name}
              </h3>

              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)] line-clamp-2">
                {service.description}
              </p>

              {service.category && (
                <span className="mt-3 inline-flex items-center rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent-deep)]">
                  {service.category}
                </span>
              )}

              {service.priceFromUsd != null && (
                <p className="mt-3 text-sm font-medium text-[var(--color-accent)]">
                  From ${service.priceFromUsd}
                </p>
              )}

              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">
                {t('services.viewDetails') || 'View Details'}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-12 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)]/60 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Don't see what you need?
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t('services.notFound') || 'We offer many more services — reach out and we\'ll help you find the right solution.'}
          </p>
          <Link
            href="/customer-service"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-primary-dark)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.571c.127-.43.505-.718.92-.718h4.58c.415 0 .792.288.919.718l1.11 3.33a.75.75 0 0 1-.321.937l-1.25.42a.75.75 0 0 0-.321.937L19.37 15h-3.08l-.89 2.67a.75.75 0 0 1-.652.361h-4.58c-.275 0-.5-.225-.499-.5a.75.75 0 0 1 .321-.937L8.12 15h-3.08L4.5 10.07a.75.75 0 0 1-.321-.937L5.4 7h4.58c.415 0 .792-.288.919-.718L8.12 4.5m11.25 4.5l-3-3m0 0l-3 3m3-3v11.25c0 .414-.336.75-.75.75h-15a.75.75 0 0 0-.75.75v3.75c0 .415.335.75.75.75h15a.75.75 0 0 0 .75-.75V8.25"/>
            </svg>
            Customer Service
          </Link>
        </div>
      </div>
    </div>
  );
}
