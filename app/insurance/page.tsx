'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface InsItem {
  id: string;
  name: string;
  provider: string;
  type: string;
  coverageUsd: number;
  premiumUsd: number;
  description: string;
  included: string;
  excluded: string;
  currency: string;
}

function InsCard({ ins, onBuy }: { ins: InsItem; onBuy: (i: InsItem) => void }) {
  const typeLabel = ins.type === 'flight' ? '✈️ Flight' : ins.type === 'medical' ? '🏥 Medical' : '🌍 Travel';
  return (
    <div className="group relative rounded-2xl border border-[#E2DFD9] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#D4AF37]/[0.3] hover:-translate-y-0.5">
      <div className="aspect-[4/3] bg-[#FAF8F3] relative">
        <div className="flex h-full items-center justify-center">
          <svg className="h-14 w-14 text-[#D4AF37]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="absolute top-3 left-3 rounded-lg bg-[#0B2545]/90 px-2.5 py-1 text-xs text-white font-bold shadow-sm">{typeLabel}</div>
        <div className="absolute top-3 right-3 rounded-lg bg-[#D4AF37] px-2.5 py-1 text-xs text-[#0F0F0E] font-bold shadow-sm">${ins.premiumUsd}</div>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#0B2545] truncate group-hover:text-[#D4AF37] transition-colors duration-200">{ins.name}</h3>
            <p className="mt-0.5 text-xs text-[#7D7A74]">{ins.provider}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-[#7D7A74]">{ins.description}</p>
        <div className="mt-3 space-y-1">
          <p className="text-xs text-[#1B4D2E]">
            <svg className="h-3 w-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {ins.included}
          </p>
          <p className="text-xs text-[#7D7A74]">
            <svg className="h-3 w-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6" />
              <path d="M12 13a2 2 0 0 0 2 2" />
            </svg>
            {ins.excluded}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#E2DFD9] pt-3">
          <span className="text-xs text-[#7D7A74]">Up to ${ins.coverageUsd.toLocaleString()} coverage</span>
          <button
            type="button"
            onClick={() => onBuy(ins)}
            className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#0F0F0E] shadow-sm transition-all duration-200 hover:bg-[#F5E7C7] hover:shadow-md"
          >
            Buy ${ins.premiumUsd}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InsurancePage() {
  const { t } = useI18n();
  const [insurances, setInsurances] = useState<InsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);
  const [selected, setSelected] = useState<InsItem | null>(null);
  const [form, setForm] = useState({ email: '', name: '', dob: '', passportNo: '', destination: '', tripDate: '', coverageUsd: 0, premiumUsd: 0 });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/insurance')
      .then((r) => r.json())
      .then((data) => setInsurances(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const openBuy = (ins: InsItem) => {
    setSelected(ins);
    setBuyOpen(true);
    setResult(null);
    setForm({
      email: 'dcuser@congoconnect.cd',
      name: 'Demo Guest',
      dob: '',
      passportNo: '',
      destination: '',
      tripDate: '',
      coverageUsd: ins.coverageUsd,
      premiumUsd: ins.premiumUsd,
    });
  };

  const submit = async () => {
    if (!selected || !form.email || !form.name) return;
    try {
      const res = await fetch('/api/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuranceId: selected.id,
          email: form.email,
          name: form.name,
          dob: form.dob || null,
          passportNo: form.passportNo || null,
          destination: form.destination || null,
          tripDate: form.tripDate || null,
          coverageUsd: selected.coverageUsd,
          premiumUsd: selected.premiumUsd,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setResult({ ref: data.data.reference, status: data.data.status });
      }
    } catch { /* ignore */ } finally {
      setBuyOpen(false);
    }
  };

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
              <span className="text-sm text-[#7D7A74] font-medium">Travel Insurance</span>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors">← Home</Link>
              <Link href="/flights" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors ml-2">Flights</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-16">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0B2545]">Travel Insurance</h1>
          <p className="mt-1.5 text-sm text-[#7D7A74]">Protect your trip — cancellation, medical, baggage, and more</p>
          <div className="mt-4 mx-auto h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        {buyOpen && selected && (
          <div className="mb-6 rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#0B2545]">Buy {selected.name}</h2>
              <button
                type="button"
                onClick={() => setBuyOpen(false)}
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label mb-1.5">Date of birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label mb-1.5">Passport #</label>
                  <input
                    type="text"
                    value={form.passportNo}
                    onChange={(e) => setForm({ ...form, passportNo: e.target.value })}
                    placeholder="Optional"
                    className="input"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label mb-1.5">Destination</label>
                  <input
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    placeholder="City/country"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label mb-1.5">Trip date</label>
                  <input
                    type="date"
                    value={form.tripDate}
                    onChange={(e) => setForm({ ...form, tripDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              {result ? (
                <div className="rounded-xl bg-[#E8F3EC] border border-[#9AC09E] p-4 text-center">
                  <p className="text-sm font-semibold text-[#1B4D2E]">✅ Policy {result.ref} purchased</p>
                  <p className="text-xs text-[#7D7A74] mt-1">${selected.premiumUsd} · {result.status}</p>
                  <button
                    onClick={() => setResult(null)}
                    className="mt-2 text-xs font-medium text-[#0B2545] hover:underline"
                  >
                    Buy another
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-center text-sm text-[#7D7A74]">
                    Premium: <strong>${selected.premiumUsd}</strong> · Coverage: ${selected.coverageUsd.toLocaleString()}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBuyOpen(false)}
                      className="flex-1 rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm font-medium text-[#7D7A74] hover:bg-[#E2DFD9] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submit}
                      disabled={!form.email || !form.name}
                      className="flex-1 rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#081A33] hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Pay & Buy
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
        ) : insurances.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545]/5 mb-4">
              <svg className="h-7 w-7 text-[#0B2545]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-[#0B2545]">No insurance products</h3>
            <p className="mt-2 text-sm text-[#7D7A74]">Check back soon for offers</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {insurances.map((ins) => (
              <InsCard key={ins.id} ins={ins} onBuy={openBuy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
