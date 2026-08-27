'use client';

import { useState, useEffect } from 'react';

interface LoyaltyData {
  userId: string;
  points: number;
  lifetimePoints: number;
  createdAt: string;
  updatedAt: string;
  pointsTransactions: any[];
}

export default function LoyaltyPage() {
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState(1000);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const fetchLoyalty = async () => {
    try {
      const res = await fetch('/api/loyalty?userId=usr_test001');
      const data = await res.json();
      setLoyalty(data.data);
    } catch (e) {
      console.error('Failed to fetch loyalty:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_test001', pointsToRedeem: redeemAmount }),
      });
      if (res.ok) {
        const data = await res.json();
        setLoyalty(prev => prev ? {
          ...prev,
          points: data.data.loyalty.points,
          pointsTransactions: [data.data.transaction, ...prev.pointsTransactions],
        } : null);
        setRedeemed(true);
        setTimeout(() => setRedeemed(false), 3000);
      }
    } catch (e) {
      console.error('Failed to redeem:', e);
    }
  };

  const handleEarn = async () => {
    try {
      const res = await fetch('/api/loyalty/earn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_test001', amount: 100, description: 'Test earning' }),
      });
      if (res.ok) {
        const data = await res.json();
        setLoyalty(prev => prev ? {
          ...prev,
          points: data.data.loyalty.points,
          lifetimePoints: data.data.loyalty.lifetimePoints,
          pointsTransactions: [data.data.transaction, ...prev.pointsTransactions],
        } : null);
      }
    } catch (e) {
      console.error('Failed to earn:', e);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  const points = loyalty?.points || 0;
  const lifetime = loyalty?.lifetimePoints || 0;
  const usdValue = points / 100;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Loyalty Points</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Earn and redeem points from bookings</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Points overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="card card-elevated p-6 text-center">
            <p className="text-sm uppercase tracking-wider text-[var(--color-text-muted)]">Current Points</p>
            <p className="mt-2 font-display text-4xl font-bold text-[var(--color-primary)]">{points.toLocaleString()}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{usdValue.toFixed(2)} USD value</p>
          </div>
          <div className="card card-elevated p-6 text-center">
            <p className="text-sm uppercase tracking-wider text-[var(--color-text-muted)]">Lifetime Points</p>
            <p className="mt-2 font-display text-4xl font-bold text-[var(--color-accent)]">{lifetime.toLocaleString()}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Total earned since signup</p>
          </div>
          <div className="card card-elevated p-6 text-center">
            <p className="text-sm uppercase tracking-wider text-[var(--color-text-muted)]">Next Redemption</p>
            <p className="mt-2 font-display text-4xl font-bold text-green-600">{Math.max(0, 10000 - points).toLocaleString()}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Points to next $100</p>
          </div>
        </div>

        {/* Recent activity */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Recent Activity</h2>
          {loyalty?.pointsTransactions && loyalty.pointsTransactions.length > 0 ? (
            <div className="card card-elevated">
              <ul className="divide-y divide-[var(--color-border-subtle)]">
                {loyalty.pointsTransactions.slice(0, 10).map((tx, i) => (
                  <li key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'earn' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type === 'earn' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={tx.type === 'earn' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center py-8 text-[var(--color-text-muted)]">No activity yet. Book a trip to earn points!</p>
          )}
        </section>

        {/* Earn / Redeem actions */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="card card-elevated p-6">
            <h3 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Earn Points</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Simulate earning points from a booking</p>
            <button onClick={handleEarn} className="btn-primary px-4 py-2 font-semibold rounded-lg">
              Earn 1000 Points ($100)
            </button>
          </div>

          <div className="card card-elevated p-6">
            <h3 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Redeem Points</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              100 points = $1. Minimum 1000 points ($10)
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="range"
                min={1000}
                max={Math.min(points, 10000)}
                step={1000}
                value={redeemAmount}
                onChange={e => setRedeemAmount(parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
            <div className="flex items-center justify-between text-sm mb-4">
              <span>{redeemAmount} points</span>
              <span className="font-semibold">${(redeemAmount / 100).toFixed(2)}</span>
            </div>
            <button
              onClick={handleRedeem}
              disabled={redeemAmount > points || redeemed}
              className="btn-primary w-full py-2 font-semibold rounded-lg disabled:opacity-50"
            >
              {redeemed ? 'Redeemed!' : 'Redeem Points'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
