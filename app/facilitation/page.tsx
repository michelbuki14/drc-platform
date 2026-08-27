'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

/* ────────────────────────────────────────────────────────────
   CongoConnect Travel Facilitation
   Premium assistance services for DRC travel
   ──────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    id: 'visa',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 0 1 1.5-1.5h3.75M10.5 6v-3.75C10.5 2.275 11.275.5 13 .5 14.725.5 15.5 1.275 15.5 3h-3.75m0 3.75v7.5C10.5 14.225 9.725 15 8 15 6.275 15 5.5 13.725 5.5 12h-3.75m0 3.75v3.75C10.5 19.225 9.225 21 7.5 21 4.5 21 2 19.5 2 17.5V13.75M12 19h.75m-.75 3.75h.75m-3.75-3.75H4.5M4.5 12h.75m3.75-3.75H15"/>
      </svg>
    ),
    title: 'Visa Assistance',
    desc: 'Full support for tourist, business, and transit visas to DRC and neighboring countries. We handle the paperwork so you don\'t have to.',
    features: ['Document checklist', 'Application review', 'Embassy liaison', 'Express processing'],
    color: 'from-[var(--color-accent)]/20 to-[var(--color-accent)]/5',
  },
  {
    id: 'transfers',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m15 4.5V16.5a1.5 1.5 0 0 0-1.5-1.5H14.25m0 0H3.375a1.125 1.125 0 0 1-1.125-1.125V7.5m15 4.5H3.375a1.125 1.125 0 0 1-1.125-1.125M14.25 3.75v10.5m-10.5 0h10.5m0 0a1.5 1.5 0 0 0 1.5-1.5m-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5m1.5-1.5v-10.5"/>
      </svg>
    ),
    title: 'Airport Transfers',
    desc: 'Private and shared transfers from Kinshasa, Lubumbashi, Goma, and other airports. Meet & greet, flight tracking, and 24/7 availability.',
    features: ['Meet & greet service', 'Flight tracking', '24/7 availability', 'Multiple vehicle classes'],
    color: 'from-[var(--color-primary)]/20 to-[var(--color-primary)]/5',
  },
  {
    id: 'hotels',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V3.75A2.25 2.25 0 0 0 20.25 1.5H3.75A2.25 2.25 0 0 0 1.5 3.75v15A2.25 2.25 0 0 0 3.75 21Z"/>
      </svg>
    ),
    title: 'Hotel Bookings',
    desc: 'Curated selection of hotels across Congo — from business stays to eco-lodges and boutique properties.',
    features: ['Best-rate guarantee', 'Corporate rates', 'Flexible cancellation', 'Local expertise'],
    color: 'from-[var(--color-warning)]/15 to-[var(--color-warning)]/5',
  },
  {
    id: 'insurance',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.959 11.959 0 0 0 3.598 6M3.598 6H9m-2.598 0a4.5 4.5 0 0 1 9 0v1.25m-7.5-2.5h4.5M12 15.5H3m7.5 0v-1.5a4.5 4.5 0 0 0-3 4.016"/>
      </svg>
    ),
    title: 'Travel Insurance',
    desc: 'Comprehensive coverage for medical, baggage, trip cancellation, and evacuation across the DRC and Central Africa region.',
    features: ['Instant coverage', 'Regional network', '24/7 claims', 'Adventure sports add-on'],
    color: 'from-[var(--color-success)]/20 to-[var(--color-success)]/5',
  },
  {
    id: 'concierge',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0L15 6m5.5 3.5H21"/>
      </svg>
    ),
    title: 'Concierge Services',
    desc: 'Personal travel assistant for reservations, recommendations, and on-the-ground support throughout your trip.',
    features: ['Restaurant bookings', 'Event tickets', 'Translation services', 'Local SIM cards'],
    color: 'from-[var(--color-primary)]/20 to-[var(--color-accent)]/5',
  },
];

export default function FacilitationPage() {
  const { t } = useI18n();
  const [activeService, setActiveService] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero section */}
      <div className="mb-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary)]/90 to-[var(--color-accent)]/40 p-8 sm:p-12 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('facilitation.title') || 'Travel Facilitation'}
          </h1>
          <p className="mt-4 text-lg text-white/80 leading-relaxed">
            {t('facilitation.desc') || 'Everything you need to travel through the DRC with confidence. From visas to transfers, hotels to concierge — we\'re your local partner.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/facilitation-services"
              className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
              </svg>
              Browse Services
            </Link>
            <Link
              href="/facilitation-services/book"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-white/90"
            >
              Book a Service
            </Link>
          </div>
        </div>
      </div>

      {/* Service cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(service => (
          <div
            key={service.id}
            className={`group relative block rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-6 transition-all duration-300 hover:border-[var(--color-accent)]/30 hover:shadow-lg hover:shadow-[var(--color-accent)]/5`}
          >
            {/* Gradient accent */}
            <div className={`absolute -right-3 -top-3 h-16 w-16 rounded-full bg-gradient-to-br ${service.color} opacity-60 blur-2xl transition-opacity group-hover:opacity-80`}/>

            <div className="relative">
              {/* Icon */}
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-[var(--color-primary)] mb-4`}>
                {service.icon}
              </div>

              <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                {service.title}
              </h3>

              <p className="mt-2 leading-relaxed text-[var(--color-text-muted)] text-sm">
                {service.desc}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {service.features.map(f => (
                  <span
                    key={f}
                    className="rounded-full bg-[var(--color-bg)]/60 px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setActiveService(activeService === service.id ? null : service.id)}
                className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-transparent bg-[var(--color-primary)]/5 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/10"
              >
                <span>Learn More</span>
                <svg
                  className={`h-4 w-4 transition-transform ${activeService === service.id ? '-rotate-45' : 'rotate-45'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                </svg>
              </button>

              {activeService === service.id && (
                <div className="mt-3 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/15 p-4">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t(`facilitation.${service.id}.desc`) || 'Our team handles every detail — from initial inquiry to final confirmation. Contact us to get started.'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/facilitation-services/book?service=${service.id}`}
                      className="rounded-lg bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-primary-dark)]"
                    >
                      Book Now
                    </Link>
                    <Link
                      href={`/facilitation-services/${service.id}`}
                      className="rounded-lg border border-[var(--color-border-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-bg)]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)]/50 p-8 text-center">
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          {t('facilitation.ctaTitle') || 'Need a custom solution?'}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {t('facilitation.ctaDesc') || 'For corporate accounts, group bookings, or specialized requests — our team is ready to help.'}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/corporate"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-primary-dark)]"
          >
            Corporate Accounts
          </Link>
          <Link
            href="/group-bookings"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-bg)]"
          >
            Group Bookings
          </Link>
          <Link
            href="/customer-service"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-bg)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.571c.127-.43.505-.718.92-.718h4.58c.415 0 .792.288.919.718l1.11 3.33a.75.75 0 0 1-.321.937l-1.25.42a.75.75 0 0 0-.321.937L19.37 15h-3.08l-.89 2.67a.75.75 0 0 1-.652.361h-4.58c-.275 0-.5-.225-.499-.5a.75.75 0 0 1 .321-.937L8.12 15h-3.08L4.5 10.07a.75.75 0 0 1-.321-.937L5.4 7h4.58c.415 0 .792-.288.919-.718L8.12 4.5m11.25 4.5l-3-3m0 0l-3 3m3-3v11.25c0 .414-.336.75-.75.75h-15a.75.75 0 0 0-.75.75v3.75c0 .415.335.75.75.75h15a.75.75 0 0 0 .75-.75V8.25"/>
            </svg>
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
