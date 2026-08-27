'use client';

import { useState, useEffect } from 'react';
import { useCargoStream } from '@/hooks/useCargoStream';

interface CargoData {
  id: string;
  trackingNo: string;
  status: string;
  origin: string;
  destination: string;
  weightKg: number;
  contents: string;
  shippedAt: string;
  etaAt: string;
  deliveredAt: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  createdAt: string;
  events: {
    id: string;
    status: string;
    location: string;
    note: string;
    createdAt: string;
  }[];
}

export default function CargoLivePage() {
  const [shipments, setShipments] = useState<CargoData[]>([]);
  const [selected, setSelected] = useState<CargoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingNo, setTrackingNo] = useState('');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await fetch('/api/cargo/live');
      const data = await res.json();
      setShipments(data.data || []);
    } catch (e) {
      console.error('Failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async () => {
    if (!trackingNo.trim()) return;
    try {
      const res = await fetch(`/api/cargo/live?trackingNo=${encodeURIComponent(trackingNo)}`);
      const data = await res.json();
      if (data.data) {
        setSelected(data.data);
      } else {
        alert('Cargo not found');
      }
    } catch (e) {
      console.error('Failed:', e);
      alert('Error tracking cargo');
    }
  };

  // Real-time updates for the selected shipment
  const live = useCargoStream(selected?.trackingNo ?? null);
  useEffect(() => {
    if (!selected) return;
    const incoming = live.lastEvent as any;
    if (incoming?.status && incoming.status !== selected.status) {
      setSelected((prev) => (prev ? { ...prev, status: incoming.status } : prev));
    }
  }, [live.lastEvent, selected]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Cargo Tracking</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Track cargo shipments in real-time</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Track a Shipment</h2>
          <div className="card card-elevated max-w-md p-6 flex gap-4">
            <input
              type="text"
              value={trackingNo}
              onChange={e => setTrackingNo(e.target.value)}
              className="input flex-1"
              placeholder="Enter tracking number"
            />
            <button onClick={handleTrack} className="btn-primary px-4 py-2 font-semibold rounded-lg">Track</button>
          </div>
        </section>

        {selected && (
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Shipment Details</h2>
            <div className="card card-elevated p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-mono font-bold text-2xl text-[var(--color-primary)]">{selected.trackingNo}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{selected.origin} → {selected.destination}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  selected.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  selected.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                  selected.status === 'customs' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selected.status}
                </span>
                <span className={`ml-2 inline-flex items-center gap-1 text-xs font-medium ${live.connected ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${live.connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  {live.connected ? 'Live' : 'Offline'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Weight</p>
                  <p className="font-semibold">{selected.weightKg} kg</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Contents</p>
                  <p className="font-semibold text-sm">{selected.contents}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Shipped At</p>
                  <p className="font-semibold">{new Date(selected.shippedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">ETA</p>
                  <p className="font-semibold">{selected.etaAt ? new Date(selected.etaAt).toLocaleString() : 'Not scheduled'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Sender</p>
                  <p className="font-semibold">{selected.senderName}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{selected.senderPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Recipient</p>
                  <p className="font-semibold">{selected.recipientName}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{selected.recipientPhone}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-[var(--color-primary)] mb-3">Tracking History</h4>
                <div className="space-y-2">
                  {selected.events.map((event, i) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium">{event.status}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{event.location} • {new Date(event.createdAt).toLocaleString()}</p>
                        {event.note && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{event.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">All Shipments ({shipments.length})</h2>
          {shipments.length === 0 ? (
            <p className="text-center py-8 text-[var(--color-text-muted)]">No shipments yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shipments.map(shipment => (
                <div key={shipment.id} className="card card-elevated p-5 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelected(shipment)}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-mono font-bold text-[var(--color-primary)]">{shipment.trackingNo}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      shipment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {shipment.status}
                    </span>
                  </div>
                  <p className="text-sm">{shipment.origin} → {shipment.destination}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>{shipment.weightKg} kg</span>
                    <span>{shipment.events?.length || 0} updates</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
