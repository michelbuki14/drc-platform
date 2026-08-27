'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n';

/* ────────────────────────────────────────────────────────────
   CongoConnect Homepage — Apple-inspired premium redesign
   ──────────────────────────────────────────────────────────── */

const AIRLINES = [
  { code: 'CAW', name: 'Congo Airways', flights: 42, status: 'on_time' },
  { code: 'CAA', name: 'Compagnie Africaine d\'Aviation', flights: 28, status: 'on_time' },
  { code: 'AF', name: 'Air France', flights: 12, status: 'on_time' },
  { code: 'TK', name: 'Turkish Airlines', flights: 8, status: 'delayed' },
  { code: 'ET', name: 'Ethiopian Airlines', flights: 15, status: 'on_time' },
  { code: 'KQ', name: 'Kenya Airways', flights: 10, status: 'on_time' },
];

const OFFERS = [
  {
    badge: 'New',
    title: 'Fly Kinshasa → Brussels from $690',
    desc: 'Air France and Brussels Airlines operate 3 weekly flights from FIH to BRU. Book your return within 24h for an extra 5% off.',
    cta: 'Search routes',
    href: '/flights?from=Kinshasa&to=Brussels&cabin=Y',
    gradient: 'from-[#0B2545] to-[#1a3a4a]',
  },
  {
    badge: 'Best value',
    title: 'Kinshasa → Lubumbashi from $185',
    desc: 'Congo Airways and CAA cover the DRC\'s busiest domestic corridor 11 times a day. Economy from $185, Business from $340.',
    cta: 'Book now',
    href: '/flights?from=Kinshasa&to=Lubumbashi&cabin=Y',
    gradient: 'from-[#D4AF37] to-[#E8CE7A]',
    textColor: 'text-[#0F0F0E]',
  },
  {
    badge: 'Cargo',
    title: 'Ship 200 kg from Goma to Johannesburg',
    desc: 'Express air cargo with customs clearance included. Door-to-door in 48h. Get an instant quote in 60 seconds.',
    cta: 'Get a quote',
    href: '/cargo',
    gradient: 'from-[#1B4D2E] to-[#2a6b44]',
  },
  {
    badge: 'Partners',
    title: 'Join the CongoConnect airline network',
    desc: 'We sell tickets on your behalf across our platform — travelers, partner agencies, and ops consoles. You get 75% of every fare, we keep 25% as commission.',
    cta: 'Partner with us',
    href: '/partner',
    gradient: 'from-[#2D2B28] to-[#4A4844]',
  },
];

const STATS = [
  { value: '6', label: 'Airlines connected', sub: 'CAW · CAA · AF · TK · ET · KQ' },
  { value: '115+', label: 'Flights per week', sub: 'Kinshasa · Lubumbashi · Goma · Kisangani' },
  { value: '25%', label: 'Commission per ticket', sub: 'We sell, you fly, we split the fare' },
  { value: '5', label: 'Payment rails', sub: 'M-Pesa · Airtel · Orange · Card · Wallet' },
];

const TRACKING_FLIGHTS = [
  { airline: 'Congo Airways', flight: 'CAW 205', from: 'FIH', to: 'GOM', status: 'On time', eta: '14:35' },
  { airline: 'CAA', flight: 'CAA 312', from: 'FIH', to: 'FBM', status: 'On time', eta: '16:20' },
  { airline: 'Air France', flight: 'AF 428', from: 'FIH', to: 'BRU', status: 'Delayed 1h', eta: '19:45' },
];

/* ── Intersection Observer for scroll-triggered reveals ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ── Reveal wrapper ─────────────────────────────────────── */
function Reveal({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal();

  return (
    <div
      ref={ref}
      className={`reveal ${className} ${delay ? `stagger-${Math.min(delay, 8)}` : ''}`}
    >
      {children}
    </div>
  );
}

/* ── Hero Section ────────────────────────────────────────── */
function HeroSection() {
  const router = useRouter();
  const { t } = useI18n();
  const [tripType, setTripType] = useState<'round' | 'oneway'>('round');
  const [from, setFrom] = useState('Kinshasa');
  const [to, setTo] = useState('Lubumbashi');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cabin, setCabin] = useState<'Y' | 'C'>('Y');
  const [passengers, setPassengers] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(() => {
    if (!departDate) return;
    if (tripType === 'round' && !returnDate) return;
    setIsSearching(true);
    const params = new URLSearchParams({
      from, to, date: departDate, cabin, pax: String(passengers),
    });
    if (tripType === 'round' && returnDate) {
      params.set('returnDate', returnDate);
    }
    router.push(`/flights?${params.toString()}`);
  }, [from, to, departDate, returnDate, tripType, cabin, passengers, router]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="relative min-h-[70vh] sm:min-h-[78vh] md:min-h-[85vh] overflow-hidden bg-[#060F1F]">
      {/* Ambient glow layers */}
      <div className="pointer-events-none absolute -top-48 -right-48 h-[38rem] w-[38rem] rounded-full bg-[#D4AF37]/[0.04] blur-[5rem]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-[#0B2545]/[0.4] blur-[4rem]" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[#D4AF37]/[0.02] blur-[6rem]" />

      {/* Subtle grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3D Scene placeholder — elegant abstract shape */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-[15%] left-[8%] h-[18rem] w-[18rem] rounded-full bg-gradient-to-br from-[#0B2545] via-[#081A33] to-transparent blur-[3rem] opacity-60"
        />
        <div
          className="absolute bottom-[20%] right-[12%] h-[12rem] w-[12rem] rounded-full bg-gradient-to-tl from-[#D4AF37]/[0.08] to-transparent blur-[2.5rem]"
        />
        <div
          className="absolute top-[30%] right-[25%] h-[8rem] w-[8rem] rounded-full bg-[#0B2545]/[0.3] blur-[2rem]"
        />
      </div>

      {/* Hero content */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 sm:pb-16 md:pb-24">
        {/* Scrim */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[33%] bg-gradient-to-t from-[#060F1F]/[0.88] via-[#060F1F]/[0.4] to-transparent sm:top-[45%]" />

        <div className="relative mx-auto max-w-[var(--max-width-content)] text-center">
          {/* Eyebrow */}
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase text-[#D4AF37]">
            <span className="h-[1px] w-8 bg-[#D4AF37]/[0.4]" />
            Travel · Cargo · Connect
            <span className="h-[1px] w-8 bg-[#D4AF37]/[0.4]" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-[-0.03em] text-white">
            The trusted DRC{' '}
            <span className="gradient-text">travel ecosystem</span>
          </h1>

          {/* Subhead */}
          <p className="mx-auto mt-4 sm:mt-5 max-w-lg text-sm sm:text-base text-white/70 leading-relaxed">
            Every airline serving the DRC — sold, tracked, and paid for through one trusted platform.
            <span className="block sm:inline text-white/60"> M-Pesa, Airtel Money, Orange Money, cards, wallet.</span>
          </p>
        </div>
      </div>

      {/* Search card — Apple glass aesthetic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-[var(--max-width-content)] px-4 sm:px-6 md:px-8">
        <div className="relative rounded-2xl bg-white/[0.92] backdrop-blur-xl p-5 sm:p-6 md:p-7 shadow-[0_20px_40px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.1)] border border-white/[0.3]">
          {/* Trip type toggle — Apple pill toggle */}
          <div className="mb-5 flex gap-1.5" role="group" aria-label="Trip type">
            {(['round', 'oneway'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTripType(type)}
                className={`relative flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  tripType === type
                    ? 'bg-white text-[#0B2545] shadow-sm ring-1 ring-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-pressed={tripType === type}
              >
                {type === 'round' ? 'Round trip' : 'One way'}
              </button>
            ))}
          </div>

          {/* Search grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="From" className="gap-1.5">
              <input
                className="input bg-white/95 text-[#0B2545] placeholder:text-[#7D7A74]/60"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                list="cities"
                placeholder="Departure city"
                aria-label="Departure city"
              />
            </Field>
            <Field label="To" className="gap-1.5">
              <input
                className="input bg-white/95 text-[#0B2545] placeholder:text-[#7D7A74]/60"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                list="cities"
                placeholder="Arrival city"
                aria-label="Arrival city"
              />
            </Field>
            <Field label="Depart" className="gap-1.5">
              <input
                type="date"
                className="input bg-white/95 text-[#0B2545] placeholder:text-[#7D7A74]/60"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                min={today}
                placeholder="Choose date"
                aria-label="Departure date"
              />
            </Field>
            {tripType === 'round' ? (
              <Field label="Return" className="gap-1.5">
                <input
                  type="date"
                  className="input bg-white/95 text-[#0B2545] placeholder:text-[#7D7A74]/60"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departDate || today}
                  placeholder="Choose date"
                  aria-label="Return date"
                />
              </Field>
            ) : (
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <Field label="Cabin" className="gap-1.5">
                    <select
                      className="select input bg-white/95 text-[#0B2545] placeholder:text-[#7D7A74]/60"
                      value={cabin}
                      onChange={(e) => setCabin(e.target.value as 'Y' | 'C')}
                      aria-label="Cabin class"
                    >
                      <option value="Y">Economy</option>
                      <option value="C">Business</option>
                    </select>
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="Passengers" className="gap-1.5">
                    <select
                      className="select input bg-white/95 text-[#0B2545] placeholder:text-[#7D7A74]/60"
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      aria-label="Number of passengers"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Search button — Apple CTA style */}
          <button
            type="button"
            onClick={search}
            disabled={!departDate || (tripType === 'round' && !returnDate) || isSearching}
            className="btn-cta mt-5 w-full bg-[#D4AF37] text-[#0F0F0E] hover:bg-[#F5E7C7] hover:text-[#0B2545] hover:shadow-[0_8px_24px_rgba(212,175,55,0.35)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-[#D4AF37] disabled:hover:text-[#0F0F0E] focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060F1F]"
            aria-label="Search flights"
          >
            {isSearching ? (
              <>
                <span className="spinner spinner-sm" />
                Searching…
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Search flights
              </>
            )}
          </button>

          {/* Cities datalist */}
          <datalist id="cities">
            {['Kinshasa', 'Lubumbashi', 'Goma', 'Kisangani', 'Brussels', 'Paris', 'Dubai', 'Istanbul', 'Johannesburg', 'Nairobi', 'Addis Ababa', 'Cairo'].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>
    </section>
  );
}

/* ── Field label wrapper ───────────────────────────────── */
function Field({ label, children, className = '' }: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col ${className}`}>
      <span className="label label-lg mb-1.5 text-[#7D7A74]">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ── Live airline card ─────────────────────────────────── */
function LiveFlightRow({ airline, status }: { airline: typeof AIRLINES[0]; status: string }) {
  const isOnTime = status === 'on_time';
  return (
    <div className="group flex items-center gap-3 rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3 transition-all duration-200 hover:bg-white/[0.09] hover:border-white/[0.14]">
      {/* Airline code badge */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white text-xs font-bold tracking-wider">
        {airline.code}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{airline.name}</p>
        <p className="text-[11px] text-white/50">{airline.flights} flights today</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`status-dot ${isOnTime ? 'status-dot-success' : 'status-dot-warning'}`}
          aria-hidden="true"
        />
        <span className={`text-xs font-medium ${isOnTime ? 'text-[#3E6E45]' : 'text-[#D97706]'}`}>
          {isOnTime ? 'On time' : 'Delayed'}
        </span>
      </div>
    </div>
  );
}

/* ── Notification banner ──────────────────────────────── */
function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMsg('Congo Airways just opened new flights on the Kinshasa → Goma route — 5 extra flights per week starting next Monday.');
      setShow(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 sm:bottom-8 left-0 right-0 z-40 mx-auto max-w-[var(--max-width-content)] px-4 animate-[slideUp_0.4s_var(--ease-out-expo)]">
      <div className="relative overflow-hidden rounded-2xl bg-[#0B2545] px-5 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/[0.1]">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/[0.15] text-[#D4AF37] text-xs font-bold">
            !
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wider text-white/80 uppercase">
              CongoConnect notification
            </p>
            <p className="mt-0.5 text-sm text-white/70 leading-relaxed">{msg}</p>
          </div>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="shrink-0 rounded-lg bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-white/[0.14]"
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Offerings card ───────────────────────────────────── */
function OfferCard({ offer }: { offer: typeof OFFERS[0] }) {
  return (
    <Link
      href={offer.href}
      className="group relative rounded-2xl bg-white border border-[#E2DFD9] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#0B2545]/[0.15] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
    >
      {/* Badge */}
      {offer.badge && (
        <span className="absolute -top-2 right-4 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold text-[#0F0F0E]">
          {offer.badge}
        </span>
      )}
      {/* Icon area */}
      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${offer.gradient} text-white font-bold text-xs shadow-sm`}>
        {offer.badge === 'Cargo' ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ) : offer.badge === 'Partners' ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20" />
          </svg>
        )}
      </div>
      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className={`font-display text-base font-bold leading-snug transition-colors group-hover:text-[#0B2545] ${offer.textColor || 'text-[#1A1A18]'}`}>
          {offer.title}
        </h3>
        <p className="mt-1.5 text-xs text-[#5C5A54] leading-relaxed">
          {offer.desc}
        </p>
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8E6D14] group-hover:gap-2 transition-all duration-200">
          {offer.cta}
          <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </p>
      </div>
    </Link>
  );
}

/* ── How it works step ────────────────────────────────── */
const ECOSYSTEM_STEPS = [
  {
    step: '01',
    title: 'Traveler books',
    desc: 'A traveler searches and books a flight on CongoConnect — via web, mobile, or through a partner agency. Payment is handled in CDF, M-Pesa, Airtel Money, Orange Money, card, or wallet.',
  },
  {
    step: '02',
    title: 'We issue the ticket',
    desc: 'CongoConnect issues the e-ticket and boarding pass (QR code + Apple Wallet .pkpass). The airline gets a clean, validated booking with full passenger details.',
  },
  {
    step: '03',
    title: '25% commission',
    desc: 'On every ticket sold, CongoConnect keeps 25% as commission. The airline receives 75% of the fare. Payments are settled weekly to the airline\'s account.',
  },
];

/* ─── Main Homepage ────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();

  // Each ref is created by useReveal() inside the component body
  const trackingRef = useRef<HTMLDivElement>(null);
  const offersRef = useRef<HTMLDivElement>(null);
  const ecosystemRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Intersection observers for each section (created once per render)
  useEffect(() => {
    const setupObserver = (ref: React.RefObject<HTMLDivElement | null>, id: string) => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    };

    setupObserver(trackingRef, 'tracking');
    setupObserver(offersRef, 'offers');
    setupObserver(ecosystemRef, 'ecosystem');
    setupObserver(whyRef, 'why');
    setupObserver(ctaRef, 'cta');
  }, [trackingRef, offersRef, ecosystemRef, whyRef, ctaRef]);

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Live tracking ── */}
      <section className="mx-auto max-w-[var(--max-width-content)] px-4 py-12 sm:py-16 md:py-20" ref={trackingRef}>
        <Reveal>
          <div className="flex items-center justify-between">
            <div>
              <div className="gold-line mb-4" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545]">
                Live airline tracking
              </h2>
              <p className="mt-1.5 text-sm text-[#7D7A74]">
                Real-time status for every airline in the CongoConnect network — updated as flights move.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#7D7A74]">
              <span className="status-dot status-dot-success" />
              Live
            </span>
          </div>
        </Reveal>

        {/* Airline rows */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {AIRLINES.map((airline) => (
            <LiveFlightRow key={airline.code} airline={airline} status={airline.status} />
          ))}
        </div>

        {/* Tracking detail cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKING_FLIGHTS.map((track) => {
            const isOnTime = track.status.startsWith('On time');
            return (
              <div
                key={track.flight}
                className="group rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-[#0B2545]/[0.12]"
              >
                <p className="font-display text-[11px] font-bold text-[#0B2545] tracking-wider uppercase">
                  {track.airline}
                </p>
                <p className="mt-0.5 text-lg font-bold text-[#1A1A18]">{track.flight}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#7D7A74]">
                  <span>{track.from} → {track.to}</span>
                  <span className="flex-1" />
                  <span>ETA {track.eta}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                      isOnTime
                        ? 'bg-[#E8F3EC] text-[#1B4D2E]'
                        : 'bg-[#FEF3C7] text-[#D97706]'
                    }`}
                  >
                    <span
                      className={`status-dot ${isOnTime ? 'status-dot-success' : 'status-dot-warning'}`}
                    />
                    {track.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Offers ── */}
      <section className="mx-auto max-w-[var(--max-width-content)] px-4 pb-12 sm:pb-16" ref={offersRef}>
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <div className="gold-line mb-4" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545]">
                Today&apos;s offers
              </h2>
              <p className="mt-1.5 text-sm text-[#7D7A74]">
                Curated routes and deals across the CongoConnect network.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {OFFERS.map((offer) => (
            <OfferCard key={offer.title} offer={offer} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-[var(--max-width-content)] px-4 py-12 sm:py-16 md:py-20" ref={ecosystemRef}>
        <Reveal>
          <div className="text-center">
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545]">
              How the CongoConnect ecosystem works
            </h2>
            <p className="mt-2 text-sm text-[#7D7A74] max-w-xl mx-auto">
              One platform, every airline. We sell tickets, you fly. We take 25% commission on every transaction.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {ECOSYSTEM_STEPS.map((item, idx) => (
            <div key={item.step} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white font-bold text-sm shadow-[0_2px_8px_rgba(11,37,69,0.2)]">
                  {item.step}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold text-[#1A1A18]">{item.title}</h3>
                  <p className="mt-1 text-xs text-[#5C5A54] leading-relaxed">{item.desc}</p>
                </div>
              </div>
              {item.step !== '03' && (
                <div className="absolute right-0 top-[1.75rem] hidden sm:block h-6 w-px bg-[#E2DFD9]" />
              )}
            </div>
          ))}
        </div>

        {/* Commission highlight card */}
        <Reveal>
          <div className="mt-8 rounded-2xl bg-[#0B2545] p-6 sm:p-8 text-white shadow-[0_10px_30px_rgba(11,37,69,0.25)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/[0.12] text-[#D4AF37] text-2xl font-bold font-sans">
                  25%
                </div>
                <div>
                  <p className="font-display text-lg font-bold">Commission on every ticket</p>
                  <p className="mt-0.5 text-sm text-white/70">
                    CongoConnect keeps 25% on every transaction. Airlines receive 75% of the fare, settled weekly.
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 text-xs text-white/80">
                {['Card', 'M-Pesa', 'Airtel', 'Orange', 'Wallet'].map((rail) => (
                  <span
                    key={rail}
                    className="rounded-lg bg-white/[0.08] px-3 py-1.5 font-medium"
                  >
                    {rail}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Stats strip ── */}
      <section className="mx-auto max-w-[var(--max-width-content)] px-4 pb-12 sm:pb-16" ref={whyRef}>
        <Reveal>
          <div className="rounded-2xl bg-[#060F1F] p-6 sm:p-8 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <div className="grid gap-6 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="font-sans text-3xl font-bold text-[#D4AF37]">{stat.value}</p>
                  <p className="mt-0.5 text-sm text-white/80">{stat.label}</p>
                  <p className="mt-0.5 text-[10px] text-white/50 tracking-wide">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Why CongoConnect ── */}
      <section className="mx-auto max-w-[var(--max-width-content)] px-4 py-12 sm:py-16" ref={ctaRef}>
        <Reveal>
          <div className="rounded-2xl border border-[#E2DFD9] bg-white p-6 sm:p-10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="mb-2 text-sm font-semibold tracking-[0.15em] uppercase text-[#D4AF37]">
              Why CongoConnect
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545]">
              The trusted layer for DRC travel &amp; logistics
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[#7D7A74] leading-relaxed">
              The DRC is Sub-Saharan Africa&apos;s largest country by landmass and one of its fastest-growing
              markets — yet travel and cargo still run on phone calls, intermediaries, and cash. CongoConnect
              is the operating system for movement: one secure platform where travelers, freight forwarders,
              and airport operations transact through the same trusted rails.
            </p>

            {/* Trust pillars */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  ),
                  title: 'Airport moat',
                  desc: '17 productized airport-service modules — built for the DRC, built by no one else.',
                },
                {
                  icon: (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 4.2 8 8 0 0 1 20 11.8C20 19.5 12 22 12 22z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ),
                  title: 'Trust by default',
                  desc: 'Signed sessions, wallet, real-time tracking — foundational rails competitors must rebuild.',
                },
                {
                  icon: (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m2.828-9.9a9 9 0 0 1 0 12.728l-4 4a9 9 0 0 1-12.728 0l-2-2" />
                    </svg>
                  ),
                  title: 'Partner flywheel',
                  desc: 'Every API partner adds supply and lowers acquisition cost — a two-sided network.',
                },
              ].map((pillar) => (
                <div key={pillar.title} className="rounded-xl bg-[#FAF8F3] p-5 border border-[#E2DFD9]">
                  <div className="text-[#0B2545] mb-3">{pillar.icon}</div>
                  <h3 className="font-display text-base font-bold text-[#0B2545]">{pillar.title}</h3>
                  <p className="mt-1 text-xs text-[#7D7A74] leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['72 pages live', '106 API routes', 'Enterprise-secure', 'CI-green'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#0B2545]/[0.05] px-3 py-1 text-xs font-semibold text-[#0B2545]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Ops console CTA ── */}
      <section className="mx-auto max-w-[var(--max-width-content)] px-4 pb-20">
        <Reveal>
          <Link
            href="/ops"
            className="group block rounded-2xl bg-[#060F1F] p-6 sm:p-8 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
          >
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/[0.1]">
                <svg className="h-6 w-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl sm:text-2xl font-bold">
                  Are you an airline, airport or logistics provider?
                </h3>
                <p className="mt-1.5 text-sm text-white/70 max-w-lg">
                  Open the CongoConnect operations console — departure board, fleet, crew, cargo
                  control, and passenger manifest — live.
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] group-hover:gap-2 transition-all duration-200">
                  Open Ops console
                  <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* ── Notification banner ── */}
      <NotificationBanner />

      {/* Scroll reveal styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo);
        }

        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </main>
  );
}
