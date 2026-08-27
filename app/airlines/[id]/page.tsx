'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface AirlineDetail {
  id: string;
  code: string;
  name: string;
  country: string;
  status: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  aircraft: { id: string; registration: string; type: string; seatsY: number; seatsC: number; status: string }[];
  flights: { id: string; flightNo: string; airline: string; departTime: string; arriveTime: string; status: string }[];
}

export default function AirlineDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [airline, setAirline] = useState<AirlineDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/airlines/${id}`).then(r => r.json()).then(d => {
      setAirline(d.data || d);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;
  if (!airline) return <div className="text-center py-12 text-muted-foreground">Airline not found</div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">{airline.name}</h1>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{airline.code} · {airline.country} · {airline.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Aircraft Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Aircraft Fleet ({airline.aircraft.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {airline.aircraft.map(ac => (
              <div key={ac.id} className="card card-elevated p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-[var(--color-primary)]">{ac.registration}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ac.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{ac.status}</span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">{ac.type}</p>
                <div className="mt-2 flex gap-3 text-xs text-[var(--color-text-muted)]">
                  <span>Y: {ac.seatsY}</span>
                  <span>C: {ac.seatsC}</span>
                </div>
              </div>
            ))}
            {airline.aircraft.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">No aircraft assigned.</p>}
          </div>
        </section>

        {/* Flights Section */}
        <section>
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Flights ({airline.flights.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-left text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                  <th className="px-4 py-3 font-semibold">Flight</th>
                  <th className="px-4 py-3 font-semibold">Departure</th>
                  <th className="px-4 py-3 font-semibold">Arrival</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {airline.flights.map(f => (
                  <tr key={f.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--cc-charcoal-50)]">
                    <td className="px-4 py-3 font-mono font-semibold text-[var(--color-primary)]">{f.flightNo}</td>
                    <td className="px-4 py-3 text-[var(--color-text)]">{f.departTime}</td>
                    <td className="px-4 py-3 text-[var(--color-text)]">{f.arriveTime}</td>
                    <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{f.status}</span></td>
                  </tr>
                ))}
                {airline.flights.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No flights yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}