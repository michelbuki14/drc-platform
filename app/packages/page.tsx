'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Package {
  id: string;
  title: string;
  description: string;
  origin: string;
  destination: string;
  airline: string | null;
  departure: string;
  return: string | null;
  duration: number;
  priceUsd: number;
  image: string | null;
  totalBookings: number;
}

function PackageCard({ pkg, onBook }: { pkg: Package; onBook: (p: Package) => void }) {
  return (
    <div className="group relative rounded-2xl border border-[#E2DFD9] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#D4AF37]/[0.3] hover:-translate-y-0.5">
      <div className="aspect-[16/9] bg-[#FAF8F3] relative">
        {pkg.image ? (
          <img src={pkg.image} alt={pkg.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-14 w-14 text-[#D4AF37]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-lg bg-[#0B2545]/90 px-2.5 py-1 text-xs text-white font-bold shadow-sm">
          {pkg.origin} → {pkg.destination}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-[#D4AF37] px-2.5 py-1 text-xs text-[#0F0F0E] font-bold shadow-sm">
          ${pkg.priceUsd} · {pkg.duration}d
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#0B2545] truncate group-hover:text-[#D4AF37] transition-colors duration-200">
              {pkg.title}
            </h3>
            <p className="mt-0.5 text-xs text-[#7D7A74]">📅 {new Date(pkg.departure).toLocaleDateString()}</p>
          </div>
        </div>
        <p className="mt-1 text-sm text-[#7D7A74] line-clamp-2">{pkg.description}</p>
        {pkg.airline && <p className="mt-1 text-xs text-[#D4AF37]">✈️ {pkg.airline}</p>}
        <div className="mt-3 flex items-center justify-between border-t border-[#E2DFD9] pt-3">
          <span className="text-sm text-[#7D7A74]">{pkg.totalBookings} booked</span>
          <button
            type="button"
            onClick={() => onBook(pkg)}
            className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#0F0F0E] shadow-sm transition-all duration-200 hover:bg-[#F5E7C7] hover:shadow-md"
          >
            Book Package
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const { t } = useI18n();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selected, setSelected] = useState<Package | null>(null);
  const [form, setForm] = useState({ email: '', name: '', phone: '', guests: '1', adults: '1', children: '0', notes: '' });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data) => setPackages(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const openBook = (pkg: Package) => {
    setSelected(pkg);
    setBookingOpen(true);
    setResult(null);
    setForm({ email: 'dcuser@congoconnect.cd', name: 'Demo Guest', phone: '', guests: '1', adults: '1', children: '0', notes: '' });
  };

  const submit = async () => {
    if (!selected || !form.email || !form.name) return;
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: selected.id,
          email: form.email,
          passengerName: form.name,
          phone: form.phone || null,
          guests: parseInt(form.guests),
          adults: parseInt(form.adults),
          children: parseInt(form.children),
          totalUsd: selected.priceUsd,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setResult({ ref: data.data.reference, status: data.data.status, total: selected.priceUsd });
      }
    } catch { /* ignore */ }
  };

  const total = selected ? selected.priceUsd : 0;

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-sm font-bold text-white shadow-sm">
                  C
                </div>
                <span className="text-base font-bold text-[#0B2545]">
                  Congo<span className="text-[#D4AF37]">Connect</span>
                </span>
              </Link>
              <span className="text-sm text-[#7D7A74] font-medium">Package Deals</span>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors">← Home</Link>
              <Link href="/flights" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors ml-2">Flights</Link>
              <Link href="/hotels" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors ml-2">Hotels</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-16">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0B2545]">Bundle & Save</h1>
          <p className="mt-1.5 text-sm text-[#7D7A74]">Flight + hotel packages for the smart traveler</p>
          <div className="mt-4 mx-auto h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        {bookingOpen && selected && (
          <div className="mb-6 rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#0B2545]">Book: {selected.title}</h2>
              <button
                type="button"
                onClick={() => setBookingOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D7A74] hover:bg-[#E2DFD9] hover:text-[#0B2545] transition-colors"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                className="input"
              />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="input"
              />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone (optional)"
                className="input"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label mb-1.5">Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label mb-1.5">Adults</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.adults}
                    onChange={(e) => setForm({ ...form, adults: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label mb-1.5">Children</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={form.children}
                    onChange={(e) => setForm({ ...form, children: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Special requests"
                rows={2}
                className="input resize-none"
              />
              {result ? (
                <div className="rounded-xl bg-[#E8F3EC] border border-[#9AC09E] p-4 text-center">
                  <p className="text-sm font-semibold text-[#1B4D2E]">✅ Booking {result.ref} confirmed</p>
                  <p className="text-xs text-[#7D7A74] mt-1">${result.total.toFixed(2)}</p>
                  <button
                    onClick={() => setResult(null)}
                    className="mt-2 text-xs font-medium text-[#0B2545] hover:underline"
                  >
                    Book another
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-center text-sm text-[#7D7A74]">Total: <strong>${total.toFixed(2)}</strong></p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingOpen(false)}
                      className="flex-1 rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm font-medium text-[#7D7A74] hover:bg-[#E2DFD9] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submit}
                      disabled={!form.email || !form.name}
                      className="flex-1 rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#081A33] hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Confirm
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
            </div>
          </div>
        ) : packages.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545]/5 mb-4">
              <svg className="h-7 w-7 text-[#0B2545]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-[#0B2545]">No packages yet</h3>
            <p className="mt-2 text-sm text-[#7D7A74]">Check back soon for bundled offers</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => (
              <PackageCard key={p.id} pkg={p} onBook={openBook} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
