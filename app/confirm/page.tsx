'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Position {
  flightNo: string;
  lat: number;
  lng: number;
  altitude: number | null;
  speed: number | null;
}

function PositionCard({p}: {p: Position}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-xs">{p.flightNo.slice(0, 3)}</span>
        <span className="font-semibold text-[var(--color-text)]">{p.flightNo}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="text-[var(--color-text-muted)]">Lat</p>
          <p className="font-mono font-semibold text-[var(--color-primary)]">{p.lat.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">Lng</p>
          <p className="font-mono font-semibold text-[var(--color-accent)]">{p.lng.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">Alt</p>
          <p className="font-mono font-semibold text-[var(--color-success)]">{p.altitude ? `${p.altitude}ft` : '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">Speed</p>
          <p className="font-mono font-semibold text-[var(--color-warning)]">{p.speed ? `${p.speed}kn` : '—'}</p>
        </div>
      </div>
    </div>
  );
}

export default function FlightMapPage() {
  const { t } = useI18n();
  const [flightNo, setFlightNo] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [single, setSingle] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flight-map');
      if (res.ok) setPositions((await res.json()).data);
    } finally { setLoading(false); }
  };

  const fetchOne = async () => {
    if (!flightNo) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/flight-map?flightNo=${encodeURIComponent(flightNo)}`);
      if (res.ok) setSingle((await res.json()).data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">C</span>
                <span className="text-base font-bold text-[var(--color-primary)]">Congo<span className="text-[var(--color-accent)]">Connect</span></span>
              </Link>
              <span className="text-sm text-[var(--color-text-muted)]">Flight Map</span>
            </div>
            <Link href="/" className="btn-ghost text-xs">← Home</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value)}
            placeholder="Flight number"
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm"
          />
          <button type="button" onClick={fetchOne} className="btn-primary text-sm whitespace-nowrap">Track</button>
        </div>

        {single && (
          <div className="mb-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-sm">{single.flightNo.slice(0, 3)}</span>
              <span className="text-xl font-bold text-[var(--color-text)]">{single.flightNo}</span>
            </div>
            <div className="mt-4 p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]">
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Current position</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Latitude</p>
                  <p className="font-mono text-xl font-bold text-[var(--color-primary)]">{single.lat.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Longitude</p>
                  <p className="font-mono text-xl font-bold text-[var(--color-accent)]">{single.lng.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Altitude</p>
                  <p className="font-mono text-lg font-semibold text-[var(--color-success)]">{single.altitude ? `${single.altitude} ft` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Speed</p>
                  <p className="font-mono text-lg font-semibold text-[var(--color-warning)]">{single.speed ? `${single.speed} kn` : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">All Aircraft (simulated)</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/>
          </div>
        ) : positions.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">No aircraft tracked</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {positions.map((p) => <PositionCard key={p.flightNo} p={p}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
