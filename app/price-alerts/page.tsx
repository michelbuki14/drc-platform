'use client';

import { useState, useEffect } from 'react';

interface PriceAlert {
  id: string;
  flightId: string;
  targetPrice: number;
  currentPrice: number;
  notified: boolean;
  email: string;
  createdAt: string;
  flight: any;
}

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({ flightId: 'CC-101', targetPrice: 100, email: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/price-alerts?userId=usr_test001');
      const data = await res.json();
      setAlerts(data.data || []);
    } catch (e) {
      console.error('Failed to fetch alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/price-alerts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_test001', ...newAlert }),
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts([data.data, ...alerts]);
        setNewAlert({ flightId: 'CC-101', targetPrice: 100, email: '' });
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to create alert:', e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Price Alerts</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Get notified when flight prices drop to your target</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Create alert */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Create Price Alert</h2>
          <form onSubmit={handleSubmit} className="card card-elevated max-w-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Flight</label>
              <select
                value={newAlert.flightId}
                onChange={e => setNewAlert({ ...newAlert, flightId: e.target.value })}
                className="input w-full"
              >
                <option value="CC-101">CC-101: Kinshasa → Goma</option>
                <option value="CC-102">CC-102: Kinshasa → Lubumbashi</option>
                <option value="CC-103">CC-103: Kinshasa → Kisangani</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Target Price (USD)</label>
              <input
                type="number"
                value={newAlert.targetPrice}
                onChange={e => setNewAlert({ ...newAlert, targetPrice: parseFloat(e.target.value) || 0 })}
                className="input w-full"
                placeholder="100"
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Email for notification</label>
              <input
                type="email"
                value={newAlert.email}
                onChange={e => setNewAlert({ ...newAlert, email: e.target.value })}
                className="input w-full"
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" disabled={creating} className="btn-primary w-full py-2 font-semibold rounded-lg disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Alert'}
            </button>
          </form>
        </section>

        {/* Existing alerts */}
        <section>
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">My Price Alerts ({alerts.length})</h2>
          {alerts.length === 0 ? (
            <p className="text-center py-8 text-[var(--color-text-muted)]">No price alerts. Create one above to track flight prices.</p>
          ) : (
            <div className="card card-elevated">
              <ul className="divide-y divide-[var(--color-border-subtle)]">
                {alerts.map(alert => (
                  <li key={alert.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold">{alert.flight?.flightNo || alert.flightId}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {alert.flight?.origin?.name || 'Kinshasa'} → {alert.flight?.destination?.name || 'Goma'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Current: <span className="font-semibold text-[var(--color-primary)]">${alert.currentPrice || 150}</span></p>
                        <p className="text-sm text-[var(--color-text-muted)]">Target: <span className={alert.currentPrice <= alert.targetPrice ? 'text-green-600 font-semibold' : ''}>${alert.targetPrice}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        alert.notified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {alert.notified ? 'Notified' : 'Watching'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
