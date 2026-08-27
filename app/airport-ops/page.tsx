'use client';

import { useState, useEffect } from 'react';

interface Terminal {
  id: string;
  code: string;
  name: string;
  airport: { code: string; name: string };
  _count?: { gates: number };
}

interface Gate {
  id: string;
  code: string;
  status: string;
  aircraftType?: string;
  terminal: { code: string; name: string };
}

interface Runway {
  id: string;
  code: string;
  lengthM: number;
  widthM: number;
  status: string;
  airport: { code: string; name: string };
}

interface GroundHandler {
  id: string;
  companyName: string;
  serviceType: string;
  status: string;
  contactName?: string;
  contactPhone?: string;
}

export default function AirportOpsPortal() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [runways, setRunways] = useState<Runway[]>([]);
  const [handlers, setHandlers] = useState<GroundHandler[]>([]);
  const [tab, setTab] = useState<'terminals' | 'gates' | 'runways' | 'handlers'>('terminals');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/airport-ops/terminals').then(r => r.json()),
      fetch('/api/airport-ops/gates').then(r => r.json()),
      fetch('/api/airport-ops/runways').then(r => r.json()),
    ]).then(([t, g, r]) => {
      setTerminals(t.data || []);
      setGates(g.data || []);
      setRunways(r.data || []);
      setLoading(false);
    });
  }, []);

  const tabs = [
    { id: 'terminals', label: 'Terminals', count: terminals.length },
    { id: 'gates', label: 'Gates', count: gates.length },
    { id: 'runways', label: 'Runways', count: runways.length },
    { id: 'handlers', label: 'Ground Handlers', count: handlers.length },
  ] as const;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Airport Operations</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Terminals, gates, runways, and ground handling</p>
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
            {tab === 'terminals' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {terminals.map(t => (
                  <div key={t.id} className="card card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-[var(--color-primary)]">{t.code}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{t.airport.code}</span>
                    </div>
                    <h3 className="font-semibold text-[var(--color-primary)]">{t.name}</h3>
                    {t._count && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{t._count.gates} gates</p>}
                  </div>
                ))}
                {terminals.length === 0 && <p className="col-span-full text-center text-[var(--color-text-muted)] py-8">No terminals yet.</p>}
              </div>
            )}

            {tab === 'gates' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {gates.map(g => (
                  <div key={g.id} className="card card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-[var(--color-primary)]">{g.code}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${g.status === 'available' ? 'bg-green-100 text-green-700' : g.status === 'occupied' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{g.status}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">{g.terminal.code}</p>
                    {g.aircraftType && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{g.aircraftType}</p>}
                  </div>
                ))}
                {gates.length === 0 && <p className="col-span-full text-center text-[var(--color-text-muted)] py-8">No gates yet.</p>}
              </div>
            )}

            {tab === 'runways' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {runways.map(r => (
                  <div key={r.id} className="card card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-[var(--color-primary)]">{r.code}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">{r.airport.code}</p>
                    <div className="mt-2 flex gap-3 text-xs text-[var(--color-text-muted)]">
                      <span>{r.lengthM}m</span>
                      <span>{r.widthM}m wide</span>
                    </div>
                  </div>
                ))}
                {runways.length === 0 && <p className="col-span-full text-center text-[var(--color-text-muted)] py-8">No runways yet.</p>}
              </div>
            )}

            {tab === 'handlers' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {handlers.map(h => (
                  <div key={h.id} className="card card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[var(--color-primary)]">{h.companyName}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{h.status}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] capitalize">{h.serviceType}</p>
                    {h.contactName && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{h.contactName} · {h.contactPhone}</p>}
                  </div>
                ))}
                {handlers.length === 0 && <p className="col-span-full text-center text-[var(--color-text-muted)] py-8">No ground handlers yet.</p>}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}