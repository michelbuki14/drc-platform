'use client';

import { useState, useEffect } from 'react';

interface Dispatch {
  id: string;
  flightNo: string;
  date: string;
  status: string;
  fuelKg?: number;
  payloadKg?: number;
  weather?: string;
  aircraft?: { registration: string; type: string };
}

interface CrewSchedule {
  id: string;
  flightNo: string;
  date: string;
  role: string;
  status: string;
  crew?: { firstName: string; lastName: string; role: string };
}

interface Maintenance {
  id: string;
  type: string;
  description: string;
  status: string;
  scheduledAt: string;
  aircraft?: { registration: string; type: string };
}

export default function OperationsPortal() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [schedules, setSchedules] = useState<CrewSchedule[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [tab, setTab] = useState<'dispatch' | 'crew' | 'maintenance'>('dispatch');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/ops/dispatch').then(r => r.json()),
      fetch('/api/ops/crew-schedules').then(r => r.json()),
      fetch('/api/ops/maintenance').then(r => r.json()),
    ]).then(([d, c, m]) => {
      setDispatches(d.data || []);
      setSchedules(c.data || []);
      setMaintenance(m.data || []);
      setLoading(false);
    });
  }, []);

  const tabs = [
    { id: 'dispatch', label: 'Flight Dispatch', count: dispatches.length },
    { id: 'crew', label: 'Crew Schedules', count: schedules.length },
    { id: 'maintenance', label: 'Maintenance', count: maintenance.length },
  ] as const;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Operations Management</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Flight dispatch, crew scheduling, and aircraft maintenance</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--color-border-subtle)] pb-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${tab === t.id ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--cc-charcoal-100)]'}`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-[var(--color-text-muted)]">Loading...</p>
        ) : (
          <>
            {tab === 'dispatch' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dispatches.map(d => (
                  <div key={d.id} className="card card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-[var(--color-primary)]">{d.flightNo}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.status === 'departed' ? 'bg-blue-100 text-blue-700' : d.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{d.status}</span>
                    </div>
                    {d.aircraft && <p className="text-sm text-[var(--color-text-muted)]">{d.aircraft.registration} · {d.aircraft.type}</p>}
                    <div className="mt-2 flex gap-3 text-xs text-[var(--color-text-muted)]">
                      {d.fuelKg && <span>Fuel: {d.fuelKg}kg</span>}
                      {d.payloadKg && <span>Payload: {d.payloadKg}kg</span>}
                    </div>
                    {d.weather && <p className="mt-1 text-xs text-[var(--color-text-muted)]">Weather: {d.weather}</p>}
                  </div>
                ))}
                {dispatches.length === 0 && <p className="col-span-full text-center text-[var(--color-text-muted)] py-8">No dispatches yet.</p>}
              </div>
            )}

            {tab === 'crew' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border-subtle)] text-left text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                      <th className="px-4 py-3 font-semibold">Crew</th>
                      <th className="px-4 py-3 font-semibold">Flight</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(s => (
                      <tr key={s.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--cc-charcoal-50)]">
                        <td className="px-4 py-3 font-semibold text-[var(--color-primary)]">{s.crew?.firstName} {s.crew?.lastName}</td>
                        <td className="px-4 py-3 font-mono">{s.flightNo}</td>
                        <td className="px-4 py-3 capitalize">{s.role}</td>
                        <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{s.status}</span></td>
                      </tr>
                    ))}
                    {schedules.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No crew schedules yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'maintenance' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {maintenance.map(m => (
                  <div key={m.id} className="card card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Check {m.type}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.status === 'completed' ? 'bg-green-100 text-green-700' : m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{m.status}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text)]">{m.description}</p>
                    {m.aircraft && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{m.aircraft.registration} · {m.aircraft.type}</p>}
                  </div>
                ))}
                {maintenance.length === 0 && <p className="col-span-full text-center text-[var(--color-text-muted)] py-8">No maintenance records yet.</p>}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}