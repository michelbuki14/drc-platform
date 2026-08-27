'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n';
import { ID_TYPES } from '@/lib/id-types';
import { AGE_CATEGORIES, ACCESSIBILITY_OPTIONS } from '@/lib/passenger-categories';
import { AccessibilityValue } from '@/lib/passenger-categories';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';

/* ────────────────────────────────────────────────────────────
   CongoConnect Flights — premium search + booking
   ──────────────────────────────────────────────────────────── */

type Flight = any;

export default function FlightsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#FAF8F3]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
          </div>
          <p className="text-sm text-[#7D7A74]">Loading flights…</p>
        </div>
      </div>
    }>
      <FlightsInner />
    </Suspense>
  );
}

function FlightsInner() {
  const sp = useSearchParams();
  const { t } = useI18n();
  const from = sp.get('from') || 'Kinshasa';
  const to = sp.get('to') || 'Lubumbashi';
  const cabin = (sp.get('cabin') as 'Y' | 'C') || 'Y';
  const pax = Number(sp.get('pax') || '1');
  const date = sp.get('date') || '';

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripType, setTripType] = useState<'round' | 'oneway'>('round');
  const [sort, setSort] = useState<'price' | 'time' | 'duration'>('price');
  const [airlineFilter, setAirlineFilter] = useState('all');
  const [seatsFilter, setSeatsFilter] = useState<'all' | 'seats' | 'soldout'>('all');
  const [booking, setBooking] = useState<Flight | null>(null);
  const [returnDate, setReturnDate] = useState(sp.get('returnDate') || '');

  useEffect(() => {
    if (!from || !to || !date) return;
    setLoading(true);
    const params = new URLSearchParams({
      from: encodeURIComponent(from),
      to: encodeURIComponent(to),
      date,
    });
    if (returnDate) params.set('returnDate', returnDate);
    fetch(`/api/flights?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setFlights(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [from, to, date, returnDate]);

  const airlines = useMemo(
    () => Array.from(new Set(flights.map((f) => f.airline))).sort(),
    [flights],
  );

  const availCount = flights.filter((f) => f.seatsAvailable > 0).length;
  const soldCount = flights.filter((f) => f.seatsAvailable === 0).length;

  const shown = useMemo(() => {
    let list = flights.filter((f) => {
      if (airlineFilter !== 'all' && f.airline !== airlineFilter) return false;
      if (seatsFilter === 'seats' && f.seatsAvailable === 0) return false;
      if (seatsFilter === 'soldout' && f.seatsAvailable > 0) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'price') return a.priceUsd - b.priceUsd;
      if (sort === 'time') return (a.departHour || 0) - (b.departHour || 0);
      return (a.durationMin || 0) - (b.durationMin || 0);
    });
    return list;
  }, [flights, airlineFilter, seatsFilter, sort]);

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* ── Top bar ── */}
      <div className="sticky top-16 z-20 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[var(--max-width-content)] items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <nav className="flex items-center gap-1.5 text-xs text-[#7D7A74]">
            <a href="/" className="hover:text-[#0B2545] transition-colors">Home</a>
            <span className="mx-1">/</span>
            <span className="text-[#0B2545] font-semibold">{from.toUpperCase()} → {to.toUpperCase()}</span>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors">
              ← New search
            </a>
          </div>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="border-b border-[#E2DFD9] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-[#0B2545]">
                {loading ? (
                  <span className="inline-block h-8 w-48 rounded bg-[#0B2545]/10 animate-pulse" />
                ) : (
                  `${shown.length} flight${shown.length !== 1 ? 's' : ''}`
                )}{' '}
                {from} → {to}
              </h1>
              <p className="text-sm text-[#7D7A74]">
                {flightDateLabel(date) || 'Select a departure date'}
                {returnDate ? ` · Return ${flightDateLabel(returnDate)}` : ''}
                {pax > 1 ? ` · ${pax} passenger${pax !== 1 ? 's' : ''}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={cabin === 'C' ? 'accent' : 'primary'}>
                {cabin === 'C' ? 'Business' : 'Economy'} cabin
              </Badge>
              {!loading && (
                <Badge variant={availCount > 0 ? 'success' : 'default'}>
                  {availCount} available
                  {soldCount > 0 && ` · ${soldCount} sold out`}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Return date field */}
        {tripType === 'round' && (
          <div className="mx-auto mt-3 max-w-[var(--max-width-content)] px-4 sm:px-6">
            <label className="block text-xs font-medium text-[#7D7A74] mb-1">Return date</label>
            <input
              type="date"
              className="w-full max-w-xs rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={date || new Date().toISOString().split('T')[0]}
              placeholder="Return date"
            />
          </div>
        )}
      </div>

      {/* ── Filter bar (sticky) ── */}
      <div className="sticky top-[5.5rem] z-20 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex flex-wrap items-center gap-3 max-w-[var(--max-width-content)] px-4 py-3 sm:px-6">
          <FilterSelect
            label="Sort by"
            value={sort}
            onChange={(v) => setSort(v as any)}
            options={[
              { value: 'price', label: 'Cheapest' },
              { value: 'time', label: 'Earliest departure' },
              { value: 'duration', label: 'Shortest flight' },
            ]}
          />
          <FilterSelect
            label="Airline"
            value={airlineFilter}
            onChange={(v) => setAirlineFilter(v)}
            options={[
              { value: 'all', label: 'All airlines' },
              ...airlines.map((a) => ({ value: a, label: a })),
            ]}
          />
          <FilterSelect
            label="Seats"
            value={seatsFilter}
            onChange={(v) => setSeatsFilter(v as any)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'seats', label: 'Has seats' },
              { value: 'soldout', label: 'Sold out' },
            ]}
          />
          {!loading && shown.length > 0 && (
            <span className="ml-auto text-xs text-[#7D7A74]">
              Sorted by {sortLabel(sort)}
              {airlineFilter !== 'all' && ` · ${airlineFilter}`}
            </span>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <section className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        <div className="space-y-4">
          {/* Loading skeleton */}
          {loading && (
            <FlightSkeleton count={4} />
          )}

          {/* Empty state */}
          {!loading && shown.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545]/5">
                <svg className="h-6 w-6 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-[#0B2545]">No flights found</h3>
              <p className="mt-2 max-w-sm text-sm text-[#7D7A74]">
                Try a different date, nearby airport, or cabin class.
              </p>
              <a href="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#081A33] hover:shadow-md">
                Search all routes
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}

          {/* Flight cards */}
          {shown.map((f, i) => (
            <FlightCard
              key={f.id}
              flight={f}
              from={from}
              to={to}
              index={i}
              cabin={cabin}
              onBook={() => setBooking(f)}
            />
          ))}
        </div>
      </section>

      {/* ── Legend / tip strip ── */}
      <div className="border-t border-[#E2DFD9] bg-white/50 backdrop-blur-sm py-3">
        <div className="mx-auto flex items-center gap-6 max-w-[var(--max-width-content)] px-4 text-xs text-[#7D7A74]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B2545]" />
            Departure
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
            Arrival
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6183B8]" />
            Connecting
          </span>
          <span className="ml-auto">Times are local · All prices in USD</span>
        </div>
      </div>

      {/* ── Booking modal ── */}
      {booking && (
        <BookingModal flight={booking} cabin={cabin} pax={pax} from={from} to={to} returnDate={returnDate} onClose={() => setBooking(null)} />
      )}
    </main>
  );
}

/* ──────────────────────── Flight Card ─────────────────────── */

function FlightCard({ flight, from, to, index, cabin, onBook }: {
  flight: any; from: string; to: string; index: number; cabin: 'Y' | 'C'; onBook: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const isNightDepart = (flight.departHour || 0) < 6 || (flight.departHour || 0) >= 20;
  const isNightArrive = ((flight.departHour || 0) + Math.floor((flight.durationMin || 0) / 60)) % 24 < 6
    || ((flight.departHour || 0) + Math.floor((flight.durationMin || 0) / 60)) % 24 >= 20;

  const departTime = flight.departHour ?? 0;
  const arriveHour = ((departTime + Math.floor((flight.durationMin || 0) / 60)) % 24);
  const arriveMin = (flight.durationMin || 0) % 60;
  const arriveTime = `${String(arriveHour).padStart(2, '0')}:${String(arriveMin).padStart(2, '0')}`;

  return (
    <div
      className={`group relative rounded-2xl border border-[#E2DFD9] bg-white p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ${
        hovered ? 'shadow-[0_8px_24px_rgba(0,0,0,0.08)] border-[#0B2545]/[0.15] -translate-y-0.5' : ''
      } ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F3]'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: airline + times + price + CTA */}
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        {/* Airline */}
        <div className="flex shrink-0 items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
            hovered ? 'bg-[#0B2545]/10 text-[#0B2545]' : 'bg-[#0B2545]/5 text-[#0B2545]'
          }`}>
            {flight.airline.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[#0B2545]">{flight.flightNo}</p>
            <p className="text-xs text-[#7D7A74]">{flight.airline}</p>
            {flight.aircraft && (
              <p className="text-xs text-[#7D7A74] mt-0.5">{flight.aircraft}</p>
            )}
          </div>
        </div>

        {/* Time visual block */}
        <div className="flex flex-1 items-center gap-3 sm:gap-6">
          {/* Depart */}
          <div className="text-center min-w-0">
            <p className={`font-display text-2xl font-bold leading-none ${
              isNightDepart ? 'text-[#6183B8]' : 'text-[#0B2545]'
            }`}>
              {String(departTime).padStart(2, '0')}:00
            </p>
            <p className="text-xs text-[#7D7A74] mt-1 truncate">{from}</p>
          </div>

          {/* Connecting line */}
          <div className="hidden sm:flex w-20 items-center justify-center shrink-0">
            {flight.isNonstop ? (
              <div className="relative h-6 w-px">
                <div className="absolute top-1/2 left-1/2 h-3 w-0.5 bg-[#D4AF37]" />
                <div className="absolute top-1/2 left-1/2 h-2.5 w-2.5 rounded-full bg-[#D4AF37] shadow-sm shadow-[#D4AF37]/40" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[#7D7A74] whitespace-nowrap">
                  {(flight.durationMin / 60).toFixed(1)}h {(flight.durationMin % 60)}m
                </div>
              </div>
            ) : (
              <div className="relative h-6 w-24 flex items-center">
                <div className="absolute top-1/2 left-0 h-0.5 w-1/2 bg-[#6183B8]" />
                <div className="absolute top-1/2 right-0 h-0.5 w-1/2 bg-[#D4AF37]" />
                <div className="relative z-10 flex w-full justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#6183B8] shadow-sm" />
                  <div className="absolute left-1/2 top-1/2 h-4 w-px bg-[#E2DFD9] -translate-x-1/2" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#D4AF37] shadow-sm ml-1" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[#7D7A74] whitespace-nowrap">
                  {(flight.durationMin / 60).toFixed(1)}h {(flight.durationMin % 60)}m · 1 stop
                </div>
              </div>
            )}
          </div>

          {/* Arrive */}
          <div className="text-center min-w-0">
            <p className={`font-display text-2xl font-bold leading-none ${
              isNightArrive ? 'text-[#B89620]' : 'text-[#0B2545]'
            }`}>
              {arriveTime}
            </p>
            <p className="text-xs text-[#7D7A74] mt-1 truncate">{to}</p>
          </div>
        </div>

        {/* Price + Book */}
        <div className="shrink-0 ml-auto sm:ml-0 sm:flex sm:flex-col sm:items-end sm:gap-3">
          <div className="text-right">
            <p className="text-xs text-[#7D7A74]">from</p>
            <p className="font-display text-2xl font-bold text-[#0B2545]">
              ${flight.priceUsd}
              {flight.priceUsd !== Math.round(flight.priceUsd) ? (
                <span className="text-sm text-[#7D7A74] font-normal">
                  {flight.priceUsd < Math.round(flight.priceUsd) ? '↓' : '↑'}
                </span>
              ) : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onBook}
            disabled={flight.seatsAvailable === 0}
            className={`rounded-xl bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none ${
              flight.seatsAvailable === 0 ? 'font-medium' : ''
            }`}
          >
            {flight.seatsAvailable === 0 ? 'Sold out' : 'Book now'}
            {flight.seatsAvailable > 0 && (
              <span className="hidden sm:inline ml-1 text-xs opacity-70">
                {flight.seatsAvailable} seat{flight.seatsAvailable !== 1 ? 's' : ''}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#7D7A74]">
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-[#A3A09A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Class: {cabin === 'C' ? 'Business' : 'Economy'}
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-[#A3A09A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          Luggage: {flight.includesCheckedBaggage ? '1 checked free' : 'Hand luggage only'}
        </span>
        {flight.refundable && (
          <span className="flex items-center gap-1.5 text-[#1B4D2E]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Refundable
          </span>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────── Loading skeleton ────────────────── */

function FlightSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-[#E2DFD9] p-4 sm:p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="flex gap-3">
              <div className="skeleton h-11 w-11 rounded-xl" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-24 rounded-lg" />
                <div className="skeleton h-3 w-20 rounded-lg" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-8 w-28 rounded-xl mx-auto" />
              <div className="skeleton h-4 w-40 rounded-lg mx-auto" />
              <div className="skeleton h-8 w-28 rounded-xl mx-auto" />
            </div>
            <div className="space-y-2">
              <div className="skeleton h-12 w-20 rounded-lg ml-auto" />
              <div className="skeleton h-9 w-24 rounded-lg ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────── Booking Modal ────────────────────── */

function BookingModal({ flight, cabin, pax, from, to, returnDate, onClose }: {
  flight: any; cabin: 'Y' | 'C'; pax: number; from: string; to: string; returnDate: string; onClose: () => void;
}) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [seat, setSeat] = useState<string | null>(null);
  const [paxData, setPaxData] = useState<Array<{
    name: string; email: string;
    idType: string; documentNo: string;
    nationality: string; ageCategory: string;
    accessibility: string;
  }>>(Array.from({ length: pax }, () => ({
    name: '', email: '', idType: 'passport', documentNo: '',
    nationality: 'CD', ageCategory: 'adult', accessibility: 'none',
  })));
  const [done, setDone] = useState<any>(null);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const seatMap = useMemo(() => {
    const rows = [];
    for (let r = 0; r < 14; r++) {
      const rowChar = String.fromCharCode(65 + r);
      const seats: Array<{ id: string; label: string; pos?: string }> = [];
      for (let i = 0; i < 6; i++) {
        seats.push({ id: `${rowChar}${i + 1}`, label: String(i + 1) });
      }
      seats.forEach((s) => {
        const n = parseInt(s.label);
        if (n === 1 || n === 4) s.pos = 'window';
        else if (n === 2 || n === 5) s.pos = 'middle';
      });
      rows.push({ row: rowChar, seats });
    }
    return rows;
  }, []);

  const stepTitle = ['', 'Passenger details', 'Seat selection', 'Confirm'];
  const stepDesc = ['', 'Enter the lead passenger name and contact details used for the booking.', 'Pick a seat. All passengers will get seats in the same row.', 'Review and complete your booking.'];

  const savePax = (i: number, k: keyof typeof paxData[0], v: string) => {
    setPaxData((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [k]: v };
      return next;
    });
  };

  const submit = async () => {
    setSubmitting(true);
    setErr('');
    try {
      const r = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: flight.id,
          cabin,
          passengerCount: pax,
          leadName: name,
          email,
          phone,
          seat: seat || undefined,
          passengers: paxData.map((p, i) => ({
            name: p.name || `Passenger ${i + 1}`,
            email: p.email || email,
            idType: p.idType,
            documentNumber: p.documentNo,
            nationality: p.nationality,
            ageCategory: p.ageCategory as any,
            accessibility: (p.accessibility as AccessibilityValue) || 'none',
          })),
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error || 'Something went wrong.');
        return;
      }
      setDone(d.data);
      setStep(4);
    } catch {
      setErr('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setStep(0);
    setDone(null);
    setErr('');
    setName('');
    setEmail('');
    setPhone('');
    setSeat(null);
    setPaxData(Array.from({ length: pax }, () => ({
      name: '', email: '', idType: 'passport', documentNo: '',
      nationality: 'CD', ageCategory: 'adult', accessibility: 'none',
    })));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#E2DFD9] shadow-2xl shadow-black/20">
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2DFD9] bg-white/90 backdrop-blur-sm px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              {step === 4 ? 'Booking confirmed' : stepTitle[step]}
            </h2>
            <p className="text-xs text-[#7D7A74]">{stepDesc[step]}</p>
          </div>
          <button
            type="button"
            onClick={step === 4 ? close : () => setStep(0)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D7A74] hover:bg-[#E2DFD9] hover:text-[#0B2545] transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-5 py-5 space-y-5">
          {step === 0 && (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-[#0B2545]/5 p-4 border border-[#0B2545]/[0.1]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white font-bold text-sm shadow-sm shadow-[#0B2545]/20">
                  {flight.airline.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0B2545]">{flight.flightNo}</p>
                  <p className="text-xs text-[#7D7A74]">{flight.airline}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-[#0B2545]">${flight.priceUsd}</p>
                  <p className="text-xs text-[#7D7A74]">from</p>
                </div>
              </div>

              <p className="text-sm text-[#7D7A74]">
                Book {flight.flightNo} from {from} to {to} on{' '}
                {new Date(flight.departDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {returnDate ? `, returning ${new Date(returnDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` : ''}.
              </p>

              <Button onClick={() => setStep(1)} variant="primary" size="lg" fullWidth>
                Continue
              </Button>
            </>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[#7D7A74]">
                Lead passenger details — used for the booking reference and e-ticket.
              </p>
              <Field label="Full name" required>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean-Pierre Ngalula"
                />
              </Field>
              <Field label="Email" required>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@example.com"
                />
              </Field>
              <Field label="Phone (optional)">
                <input
                  className="input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+243 81 000 0000"
                />
              </Field>

              <div className="border-t border-[#E2DFD9] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7D7A74] mb-3">
                  Additional passengers ({pax - 1})
                </p>
                <div className="space-y-3">
                  {paxData.slice(1).map((p, i) => (
                    <div key={i} className="rounded-xl border border-[#E2DFD9] p-4 bg-[#FAF8F3]">
                      <p className="text-xs font-medium text-[#7D7A74] mb-2">Passenger {i + 2}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Name">
                          <input
                            className="input text-sm"
                            value={p.name}
                            onChange={(e) => savePax(i + 1, 'name', e.target.value)}
                            placeholder="Full name"
                          />
                        </Field>
                        <Field label="Email">
                          <input
                            className="input text-sm"
                            type="email"
                            value={p.email}
                            onChange={(e) => savePax(i + 1, 'email', e.target.value)}
                            placeholder="email@example.com"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <div className="flex gap-3">
                <Button onClick={() => setStep(0)} variant="ghost">Back</Button>
                <Button onClick={() => setStep(2)} variant="primary" size="lg" className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#7D7A74]">
                Select a seat for the lead passenger. All passengers will be seated together.
              </p>

              <div className="grid gap-2 sm:gap-3 justify-items-center">
                {seatMap.map((row) => (
                  <div key={row.row} className="flex justify-center gap-1">
                    {row.seats.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSeat(s.id)}
                        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-md text-xs font-semibold transition-all duration-150 ${
                          seat === s.id
                            ? 'bg-[#D4AF37] text-[#0F0F0E] ring-2 ring-[#D4AF37]/50 shadow-sm'
                            : 'bg-white border border-[#E2DFD9] text-[#5C5A54] hover:border-[#0B2545] hover:text-[#0B2545]'
                        }`}
                        aria-label={`Seat ${s.id}`}
                      >
                        {s.label}
                        {s.pos === 'window' && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#0B2545]/10" />
                        )}
                      </button>
                    ))}
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-[#7D7A74]">{row.row}</span>
                      <div className="w-px h-8 bg-[#E2DFD9]" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 text-xs text-[#7D7A74]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0B2545]/10 border border-[#E2DFD9]" />
                  Window
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#FAF8F3] border border-[#E2DFD9]" />
                  Aisle
                </span>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="ghost">Back</Button>
                <Button onClick={() => setStep(3)} variant="primary" size="lg" className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#E2DFD9] bg-[#FAF8F3] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white text-xs font-bold">
                      {flight.airline.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0B2545]">{flight.flightNo}</p>
                      <p className="text-xs text-[#7D7A74]">{flight.airline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-[#0B2545]">${flight.priceUsd}</p>
                    <p className="text-xs text-[#7D7A74]">total</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#7D7A74]">
                  <span>{flight.departHour}:00 {from}</span>
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span>{flight.arriveHour}:00 {to}</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#E2DFD9] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7D7A74] mb-2">Lead passenger</p>
                <div className="space-y-1 text-sm text-[#1A1A18]">
                  <p>{name || '—'}</p>
                  <p className="text-[#7D7A74]">{email || '—'}</p>
                </div>
              </div>

              {seat && (
                <div className="rounded-xl border border-[#E2DFD9] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7D7A74] mb-2">Seat</p>
                  <p className="text-lg font-bold text-[#0B2545]">{seat}</p>
                </div>
              )}

              <p className="text-xs text-[#7D7A74] bg-[#FAF8F3] rounded-lg p-3 border border-[#E2DFD9]">
                By continuing, you agree to our Terms of Service and confirm that the passenger details are correct.
              </p>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="ghost">Back</Button>
                <Button onClick={submit} variant="primary" size="lg" className="flex-1" disabled={submitting}>
                  {submitting ? 'Booking…' : 'Confirm booking'}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && done && (
            <div className="text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4D2E] mb-4">
                <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#0B2545]">Booking confirmed</h2>
              <p className="mt-2 text-sm text-[#7D7A74]">
                Your e-ticket for {flight.flightNo} has been issued.
              </p>

              <div className="mt-5 rounded-xl border border-[#E2DFD9] bg-white p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7D7A74] mb-2">Reference</p>
                <p className="font-mono text-lg font-bold text-[#0B2545]">{done.reference}</p>
                <p className="mt-2 text-xs text-[#7D7A74]">{done.status}</p>
              </div>

              <p className="mt-4 text-xs text-[#7D7A74]">
                A copy has been sent to {email || 'your email'}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Form helpers ────────────────────── */

function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#7D7A74]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#E2DFD9] bg-white px-3 py-2">
      <span className="text-xs font-medium text-[#7D7A74]">{label}</span>
      <select
        className="select w-full bg-transparent text-sm text-[#1A1A18] focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function sortLabel(s: string) {
  return ({ price: 'price', time: 'departure time', duration: 'flight duration' }[s] || s);
}

function flightDateLabel(d: string) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
