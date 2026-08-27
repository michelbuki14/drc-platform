'use client';

import { useState, useEffect, useCallback } from 'react';

interface ReferralData {
  id: string;
  code: string;
  userId: string;
  referredEmail: string;
  status: string;
  rewardUsd: number;
  createdAt: string;
  acceptedAt: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [myCode, setMyCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [created, setCreated] = useState(false);

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await fetch('/api/referrals?userId=usr_test001');
      const data = await res.json();
      setReferrals(data.data || []);
      if (data.data && data.data.length > 0 && !myCode) {
        setMyCode(data.data[0].code);
      }
    } catch (e) {
      console.error('Failed to fetch referrals:', e);
    } finally {
      setLoading(false);
    }
  }, [myCode]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleCreateReferral = async () => {
    if (!newEmail.trim()) return;
    try {
      const res = await fetch('/api/referrals/refer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_test001', referredEmail: newEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setMyCode(data.code);
        setNewEmail('');
        setCreated(true);
        setTimeout(() => setCreated(false), 3000);
        fetchReferrals();
      }
    } catch (e) {
      console.error('Failed to create referral:', e);
    }
  };

  const handleClaim = async (code: string) => {
    try {
      const res = await fetch('/api/referrals/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId: 'usr_test001' }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchReferrals();
      }
    } catch (e) {
      console.error('Failed to claim referral:', e);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Referrals</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Earn $10 for every friend who books using your code</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* My referral code */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Your Referral Code</h2>
          {myCode ? (
            <div className="card card-elevated p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Share this code with friends:</p>
                <p className="mt-2 font-mono text-2xl font-bold text-[var(--color-primary)]">{myCode}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">$10 reward for each successful referral</p>
              </div>
              <button className="btn-primary px-4 py-2 font-semibold rounded-lg">
                Copy Code
              </button>
            </div>
          ) : (
            <div className="card card-elevated p-6">
              <p className="text-sm text-[var(--color-text-muted)] mb-4">Don't have a referral code yet? Create one:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="input flex-1"
                  placeholder="Friend's email"
                />
                <button onClick={handleCreateReferral} disabled={created || !newEmail.trim()} className="btn-primary px-4 py-2 font-semibold rounded-lg disabled:opacity-50">
                  {created ? 'Done!' : 'Create Code'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Referral history */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Referral History ({referrals.length})</h2>
          {referrals.length === 0 ? (
            <p className="text-center py-8 text-[var(--color-text-muted)]">No referrals yet.</p>
          ) : (
            <div className="card card-elevated">
              <ul className="divide-y divide-[var(--color-border-subtle)]">
                {referrals.map(ref => (
                  <li key={ref.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ref: {ref.code}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{new Date(ref.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ref.status === 'rewarded' ? 'bg-green-100 text-green-700' :
                        ref.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ref.status}
                      </span>
                      <span className="font-semibold">${ref.rewardUsd}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Claim a code */}
        <section>
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Claim a Referral Code</h2>
          <div className="card card-elevated p-6">
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Have a referral code? Enter it to claim your $10 reward:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={myCode || ''}
                className="input flex-1 font-mono"
                placeholder="e.g. REF-123456"
                readOnly
              />
              <button onClick={() => myCode && handleClaim(myCode)} className="btn-primary px-4 py-2 font-semibold rounded-lg">
                Claim Reward
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
