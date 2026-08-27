'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

/* ────────────────────────────────────────────────────────────
   CongoConnect Crew Management
   Crew members, duty hours, license tracking, assignments
   ──────────────────────────────────────────────────────────── */

interface CrewMember {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  role: string;
  baseAirport: string;
  licenseExpiry?: string;
  dutyHoursThisWeek: number;
  maxDutyHours: number;
  assignments?: { id: string; flightNo: string; schedDepart: string }[];
}

interface CrewForm {
  employeeNo: string;
  firstName: string;
  lastName: string;
  role: string;
  baseAirport: string;
  licenseExpiry: string;
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

export default function CrewPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CrewForm>({
    employeeNo: '', firstName: '', lastName: '', role: 'flight_attendant', baseAirport: 'FIH', licenseExpiry: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCrew = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ops/crew');
      if (!res.ok) throw new Error('Failed to load crew');
      const data = await res.json();
      setCrew(data.data?.crew ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCrew(); }, [fetchCrew]);

  const addCrew = async () => {
    if (!form.employeeNo || !form.firstName || !form.lastName) {
      setError('Employee number, first name, and last name are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/ops/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to add crew member');
      }
      setForm({ employeeNo: '', firstName: '', lastName: '', role: 'flight_attendant', baseAirport: 'FIH', licenseExpiry: '' });
      setTab('list');
      fetchCrew();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const dutyPercentage = (hours: number, max: number) => Math.min(100, (hours / max) * 100);
  const dutyColor = (hours: number, max: number) => {
    const pct = dutyPercentage(hours, max);
    if (pct >= 90) return 'bg-[var(--color-error)]';
    if (pct >= 70) return 'bg-[var(--color-warning)]';
    return 'bg-[var(--color-success)]';
  };

  const roleLabel = (role: string) => ({
    captain: 'Captain',
    first_officer: 'First Officer',
    purser: 'Purser',
    flight_attendant: 'Flight Attendant',
    engineer: 'Engineer',
  }[role] ?? role);

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
              <span className="text-sm text-[var(--color-text-muted)] hidden sm:block">Crew Management</span>
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
          { key: 'list', label: 'Crew Roster' },
          { key: 'add', label: 'Add Crew' },
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
              <p className="text-sm text-[var(--color-text-muted)]">{crew.length} crew member{crew.length !== 1 ? 's' : ''}</p>
              <button type="button" onClick={fetchCrew} className="text-xs text-[var(--color-primary)] hover:underline">Refresh</button>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map(n => <div key={n} className="animate-pulse rounded-2xl bg-[var(--color-surface)] h-32"/>)}</div>
            ) : crew.length === 0 ? (
              <EmptyState icon="👨‍✈️" title="No crew members" desc="Add crew members to build your roster."/>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {crew.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-bold">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{roleLabel(c.role)} · {c.employeeNo}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Duty hours</p>
                        <div className="mt-1 h-2 rounded-full bg-[var(--color-border)]">
                          <div className={`h-2 rounded-full ${dutyColor(c.dutyHoursThisWeek, c.maxDutyHours)}`} style={{ width: `${dutyPercentage(c.dutyHoursThisWeek, c.maxDutyHours)}%` }}/>
                        </div>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{c.dutyHoursThisWeek}h / {c.maxDutyHours}h</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">License</p>
                        <p className={`text-xs font-medium mt-1 ${c.licenseExpiry && new Date(c.licenseExpiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                          {c.licenseExpiry ? new Date(c.licenseExpiry).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {c.assignments && c.assignments.length > 0 && (
                      <div className="pt-3 border-t border-[var(--color-border-subtle)]">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Upcoming</p>
                        {c.assignments.slice(0, 2).map((a) => (
                          <p key={a.id} className="text-xs text-[var(--color-text-secondary)]">{a.flightNo} · {new Date(a.schedDepart).toLocaleString()}</p>
                        ))}
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
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Add crew member</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Employee No. *</label>
                  <input type="text" value={form.employeeNo} onChange={(e) => setForm({...form, employeeNo: e.target.value})} placeholder="EMP-001" className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]">
                    <option value="captain">Captain</option>
                    <option value="first_officer">First Officer</option>
                    <option value="purser">Purser</option>
                    <option value="flight_attendant">Flight Attendant</option>
                    <option value="engineer">Engineer</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">First name *</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Last name *</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Base airport</label>
                  <input type="text" value={form.baseAirport} onChange={(e) => setForm({...form, baseAirport: e.target.value})} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">License expiry</label>
                  <input type="date" value={form.licenseExpiry} onChange={(e) => setForm({...form, licenseExpiry: e.target.value})} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
              </div>
              <button type="button" onClick={addCrew} disabled={submitting} className="btn-primary w-full py-3">
                {submitting ? 'Adding...' : 'Add crew member'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
