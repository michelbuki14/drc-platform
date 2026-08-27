'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Airline {
  id: string;
  code: string;
  name: string;
  country: string;
  status: string;
  _count?: { aircraft: number; flights: number };
}

export default function AirlinesPortal() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', country: 'CD', website: '', contactEmail: '', contactPhone: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/airlines').then(r => r.json()).then(d => {
      setAirlines(d.data || []);
      setLoading(false);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/airlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ code: '', name: '', country: 'CD', website: '', contactEmail: '', contactPhone: '' });
      const updated = await fetch('/api/airlines').then(r => r.json());
      setAirlines(updated.data || []);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Airlines Portal</h1>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Manage airlines, aircraft, and flight operations</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 text-sm font-semibold rounded-lg">
              {showForm ? 'Cancel' : '+ Add Airline'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {showForm && (
          <form onSubmit={submit} className="card card-elevated mb-8 p-6">
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">New Airline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className="input" placeholder="Airline Code (e.g. CC)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
              <input className="input" placeholder="Airline Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
              <input className="input" placeholder="Website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
              <input className="input" placeholder="Contact Email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
              <input className="input" placeholder="Contact Phone" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary mt-4 px-6 py-2 text-sm font-semibold rounded-lg">Create Airline</button>
          </form>
        )}

        {loading ? (
          <p className="text-center text-[var(--color-text-muted)]">Loading airlines...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {airlines.map((airline) => (
              <Link key={airline.id} href={`/airlines/${airline.id}`} className="card card-elevated p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded">{airline.code}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${airline.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {airline.status}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--color-primary)]">{airline.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{airline.country}</p>
                {airline._count && (
                  <div className="mt-3 flex gap-4 text-xs text-[var(--color-text-muted)]">
                    <span>{airline._count.aircraft} aircraft</span>
                    <span>{airline._count.flights} flights</span>
                  </div>
                )}
              </Link>
            ))}
            {airlines.length === 0 && (
              <p className="col-span-full text-center text-[var(--color-text-muted)] py-12">No airlines yet. Add your first airline to get started.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}