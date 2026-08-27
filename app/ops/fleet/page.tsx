'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

/* ────────────────────────────────────────────────────────────
   CongoConnect Fleet Management
   Aircraft list, status, maintenance tracking, add aircraft
   ──────────────────────────────────────────────────────────── */

interface Aircraft {
  id: string;
  registration: string;
  type: string;
  name?: string;
  seatsY: number;
  seatsC: number;
  rangeKm: number;
  status: string;
  homeBase: string;
  engineHours: number;
  nextMaintDueAt?: string;
}

interface AircraftForm {
  registration: string;
  type: string;
  name: string;
  seatsY: string;
  seatsC: string;
  rangeKm: string;
  homeBase: string;
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/5">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--color-text)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{desc}</p>
    </div>
  );
}

export default function FleetPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<AircraftForm>({
    registration: '', type: '', name: '', seatsY: '', seatsC: '', rangeKm: '', homeBase: 'FIH'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFleet = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ops/fleet');
      if (!res.ok) throw new Error('Failed to load fleet');
      const data = await res.json();
      setFleet(data.data?.aircraft ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFleet(); }, [fetchFleet]);

  const addAircraft = async () => {
    if (!form.registration || !form.type || !form.seatsY || !form.rangeKm) {
      setError('Registration, type, economy seats, and range are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/ops/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration: form.registration,
          type: form.type,
          name: form.name,
          seatsY: parseInt(form.seatsY),
          seatsC: parseInt(form.seatsC) || 0,
          rangeKm: parseInt(form.rangeKm),
          homeBase: form.homeBase,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to add aircraft');
      }
      setForm({ registration: '', type: '', name: '', seatsY: '', seatsC: '', rangeKm: '', homeBase: 'FIH' });
      setTab('list');
      fetchFleet();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status: string) => ({
    active: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    maintenance: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    grounded: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
    retired: 'bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)]',
  }[status] ?? 'bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)]');

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">C</span>
                <span className="text-base font-bold text-[var(--color-primary)]">Congo<span className="text-[var(--color-accent)]">Connect</span></span>
              </Link>
              <span className="h-4 w-px bg-[var(--color-border)] hidden sm:block"/>
              <span className="text-sm text-[var(--color-text-muted)] hidden sm:block">Fleet Management</span>
            </div>
            <div className="flex gap-2">
              <Link href="/ops" className="btn-ghost text-xs">← Ops</Link>
              <Link href="/" className="btn-ghost text-xs">Home</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 px-4">
        {[
          { key: 'list', label: 'Aircraft' },
          { key: 'add', label: 'Add Aircraft' },
        ].map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setTab(key as any)}
            className={`mr-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        {error && <div className="mb-4 rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">{error}</div>}

        {tab === 'list' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-muted)]">{fleet.length} aircraft{fleet.length !== 1 ? 's' : ''}</p>
              <button type="button" onClick={fetchFleet} className="text-xs text-[var(--color-primary)] hover:underline">Refresh</button>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map(n => <div key={n} className="animate-pulse rounded-2xl bg-[var(--color-surface)] h-40"/>)}</div>
            ) : fleet.length === 0 ? (
              <EmptyState icon="✈️" title="No aircraft" desc="Add aircraft to build your fleet."/>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {fleet.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-bold">
                          {a.registration.slice(-2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">{a.registration}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{a.type} {a.name && `· ${a.name}`}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(a.status)}`}>{a.status}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Seats</p>
                        <p className="text-xs font-medium text-[var(--color-text)]">{a.seatsY + a.seatsC}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Range</p>
                        <p className="text-xs font-medium text-[var(--color-text)]">{a.rangeKm.toLocaleString()}km</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Engine hrs</p>
                        <p className="text-xs font-medium text-[var(--color-text)]">{a.engineHours}</p>
                      </div>
                    </div>

                    {a.nextMaintDueAt && (
                      <div className="pt-3 border-t border-[var(--color-border-subtle)]">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Next maintenance</p>
                        <p className={`text-xs font-medium ${new Date(a.nextMaintDueAt) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                          {new Date(a.nextMaintDueAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'add' && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-sm max-w-2xl">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Add aircraft</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Registration *</label>
                  <input type="text" value={form.registration} onChange={(e) => setForm({...form, registration: e.target.value})} placeholder="9S-ABC" className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Type *</label>
                  <input type="text" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} placeholder="B737-800" className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Mount Kilimanjaro" className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Home base</label>
                  <input type="text" value={form.homeBase} onChange={(e) => setForm({...form, homeBase: e.target.value})} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Econ seats *</label>
                  <input type="number" value={form.seatsY} onChange={(e) => setForm({...form, seatsY: e.target.value})} placeholder="150" className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Biz seats</label>
                  <input type="number" value={form.seatsC} onChange={(e) => setForm({...form, seatsC: e.target.value})} placeholder="12" className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Range (km) *</label>
                  <input type="number" value={form.rangeKm} onChange={(e) => setForm({...form, rangeKm: e.target.value})} placeholder="5000" className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
              </div>
              <button type="button" onClick={addAircraft} disabled={submitting} className="btn-primary w-full py-3">
                {submitting ? 'Adding...' : 'Add aircraft'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
