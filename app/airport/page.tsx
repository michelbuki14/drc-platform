'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface FlightStatus {
  flightNo: string;
  status: string;
  gate: string | null;
  terminal: string | null;
  delayMin: number;
  estimatedArrival: string | null;
}

interface POI { id: string; category: string; name: string; level: string | null; hours: string | null; }
interface ChecklistItem { id: string; label: string; done: boolean; }

const CATEGORY_ICONS: Record<string, string> = {
  gate: '🚪', security: '🛂', immigration: '📋', customs: '🧳', restaurant: '🍽️',
  cafe: '☕', bar: '🍸', dutyfree: '🛍️', lounge: '🛋️', pray: '🕌', restroom: '🚻',
  elevator: '🛗', escalator: '🪜', charging: '🔌', exchange: '💱', atm: '🏧',
  info: 'ℹ️', medical: '⚕️', lostfound: '🔎', taxi: '🚕', rideshare: '🚗',
  carrental: '🚙', parking: '🅿️', wifi: '📶', police: '👮', embassy: '🏛️',
};

const QUICK_LINKS = [
  { href: '/airport/maps', label: 'Airport Maps', icon: '🗺️' },
  { href: '/airport/transport', label: 'Transportation', icon: '🚐' },
  { href: '/airport/assistance', label: 'Assistance', icon: '🤝' },
  { href: '/airport/baggage', label: 'Baggage', icon: '🧳' },
  { href: '/airport/lounges', label: 'Lounges', icon: '🛋️' },
  { href: '/airport/dining', label: 'Food & Drink', icon: '🍽️' },
  { href: '/airport/shopping', label: 'Shopping', icon: '🛍️' },
  { href: '/airport/hotels', label: 'Hotels', icon: '🏨' },
  { href: '/airport/car-rentals', label: 'Car Rentals', icon: '🚙' },
  { href: '/airport/currency', label: 'Currency', icon: '💱' },
  { href: '/airport/wifi', label: 'Wi-Fi', icon: '📶' },
  { href: '/airport/emergency', label: 'Emergency', icon: '🚨' },
  { href: '/airport/assistant', label: 'AI Assistant', icon: '🤖' },
  { href: '/flight-status', label: 'Flight Tracking', icon: '✈️' },
];

export default function AirportHubPage() {
  const { t } = useI18n();
  const [flights, setFlights] = useState<FlightStatus[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [fRes, pRes] = await Promise.all([
          fetch('/api/flight-status').then(r => r.ok ? r.json() : { data: [] }),
          fetch('/api/airport/pois?airportId=apt_fih').then(r => r.ok ? r.json() : { data: [] }),
        ]);
        setFlights((fRes.data || []).slice(0, 4));
        setPois((pRes.data || []).slice(0, 8));
        setChecklist([
          { id: '1', label: 'Check in online', done: false },
          { id: '2', label: 'Pack passport & visa', done: false },
          { id: '3', label: 'Arrive 3h before flight', done: false },
          { id: '4', label: 'Confirm transport', done: false },
        ]);
      } catch {
        // Graceful degradation if offline
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (id: string) => setChecklist(c => c.map(i => i.id === id ? { ...i, done: !i.done } : i));

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        {/* Hero / day-of-travel header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#0B2545] via-[#0B2545] to-[#1a3a4a] p-6 sm:p-8 text-white shadow-[0_8px_24px_rgba(11,37,69,0.25)] border border-[#081A33]/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#D4AF37]/[0.06] blur-2xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-8 h-24 w-24 rounded-full bg-[#0B2545]/[0.3] blur-xl" />

          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">N'djili International · FIH</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold">Your Airport Companion</h1>
            <p className="mt-1 text-sm opacity-90">Track flights, find your way, book services — all in one place.</p>
          </div>
        </div>

        {/* Upcoming flights */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-display font-bold text-[#0B2545]">Upcoming Flights</h2>
          {loading ? (
            <div className="animate-pulse rounded-xl bg-white border border-[#E2DFD9] h-24" />
          ) : flights.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#E2DFD9] bg-white p-6 text-center">
              <p className="text-sm text-[#7D7A74]">No active flights. <Link href="/flights" className="text-[#0B2545] hover:underline font-medium">Browse flights</Link></p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {flights.map(f => (
                <div key={f.flightNo} className="rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-[#0B2545]">{f.flightNo}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      f.delayMin > 0 ? 'bg-[#FEF3C7] text-[#9A5B3C]'
                      : 'bg-[#E8F3EC] text-[#1B4D2E]'
                    }`}>
                      {f.status}{f.delayMin > 0 ? ` · +${f.delayMin}m` : ''}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-[#7D7A74]">
                    <span>🚪 {f.gate || 'TBD'}</span>
                    <span>🏢 {f.terminal || 'TBD'}</span>
                    {f.estimatedArrival && <span>🕐 {new Date(f.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick links grid */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-display font-bold text-[#0B2545]">Services</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {QUICK_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="group flex flex-col items-center gap-2 rounded-xl border border-[#E2DFD9] bg-white p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#0B2545]/[0.15] hover:-translate-y-0.5">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{l.icon}</span>
                <span className="text-xs font-medium text-[#1A1A18] group-hover:text-[#0B2545] transition-colors duration-200">{l.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Two-column: Facilities + Checklist */}
        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-display font-bold text-[#0B2545]">Nearby Facilities</h2>
            <div className="space-y-2">
              {pois.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-[#E2DFD9] bg-white p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="text-lg">{CATEGORY_ICONS[p.category] || '📍'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0B2545] truncate">{p.name}</p>
                    <p className="text-xs text-[#7D7A74]">{p.level}{p.hours ? ` · ${p.hours}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/airport/maps" className="mt-2 inline-block text-xs font-medium text-[#0B2545] hover:underline">View full map →</Link>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-display font-bold text-[#0B2545]">Travel Checklist</h2>
            <div className="space-y-2">
              {checklist.map(item => (
                <label key={item.id} className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[#E2DFD9] bg-white p-3 shadow-sm hover:shadow-md hover:border-[#0B2545]/[0.1] transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggle(item.id)}
                    className="h-4 w-4 shrink-0 rounded-md border-[#E2DFD9] bg-white text-[#D4AF37] focus:ring-[#D4AF37]/30 focus:ring-offset-white transition-all"
                  />
                  <span className={`text-sm transition-all duration-200 ${item.done ? 'text-[#7D7A74] line-through' : 'text-[#1A1A18]'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
