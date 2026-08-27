'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface GiftCard {
  id: string;
  code: string;
  amountUsd: number;
  status: string;
  recipientEmail: string | null;
  message: string | null;
  createdAt: string;
}

export default function GiftCardsPage() {
  const { t } = useI18n();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [form, setForm] = useState({
    amount: '50',
    currency: 'USD',
    recipientEmail: '',
    message: '',
    personal: false,
    sendToSelf: false,
  });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/gift-cards?userId=usr_test001')
      .then(r => r.json())
      .then(data => setCards(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const purchase = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    setBuyOpen(false);
    try {
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_test001',
          amountUsd: parseFloat(form.amount),
          currency: form.currency,
          status: 'active',
          personal: form.personal,
          sendToSelf: form.sendToSelf,
          recipientEmail: form.sendToSelf || form.personal ? form.recipientEmail || null : null,
          message: form.message || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setResult({ code: data.data.code, amount: data.data.amountUsd, status: data.data.status });
        setCards(prev => [data.data, ...prev]);
        setForm({ amount: '50', currency: 'USD', recipientEmail: '', message: '', personal: false, sendToSelf: false });
      }
    } catch { /* ignore */ }
  };

  const send = async () => {
    if (!form.recipientEmail || !form.amount) return;
    setSendOpen(false);
    try {
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_test001',
          amountUsd: parseFloat(form.amount),
          currency: form.currency,
          status: 'sent',
          personal: true,
          sendToSelf: false,
          recipientEmail: form.recipientEmail,
          message: form.message || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setResult({ code: data.data.code, amount: data.data.amountUsd, sentTo: data.data.recipientEmail, status: data.data.status });
        setCards(prev => [data.data, ...prev]);
        setForm({ amount: '50', currency: 'USD', recipientEmail: '', message: '', personal: false, sendToSelf: false });
      }
    } catch { /* ignore */ }
  };

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
              <span className="text-sm text-[var(--color-text-muted)]">Gift Cards</span>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="btn-ghost text-xs">← Home</Link>
              <Link href="/flights" className="btn-ghost text-xs">Flights</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Gift Cards</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Give the gift of travel — redeemable for any CongoConnect booking</p>
        </div>

        {/* Result banner */}
        {result && (
          <div className="mb-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm max-w-md mx-auto text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success)]/20 mb-3">
              <span className="text-xl">🎁</span>
            </div>
            <p className="text-sm font-semibold text-[var(--color-success)]">Gift card {result.code} created</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {result.sentTo ? `Sent to ${result.sentTo}` : `${result.amount.toFixed(2)} USD · ${result.status}`}
            </p>
            <button onClick={() => setResult(null)} className="mt-3 btn-ghost-outline text-xs">Done</button>
          </div>
        )}

        {/* Buy / Send modals */}
        {buyOpen && (
          <div className="mb-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Buy Gift Card</h2>
              <button onClick={() => setBuyOpen(false)} className="text-2xl leading-none text-[var(--color-text-muted)] hover:text-[var(--color-text)]">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <input type="number" min={1} step={5} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount (USD)" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-center text-lg font-bold"/>
              <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                <input type="checkbox" checked={form.personal} onChange={e => setForm({ ...form, personal: e.target.checked })} className="rounded"/>
                Personal card (for yourself)
              </label>
              {form.personal ? (
                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                  <input type="checkbox" checked={form.sendToSelf} onChange={e => setForm({ ...form, sendToSelf: e.target.checked })} className="rounded"/>
                  Deposit to wallet (redeem now)
                </label>
              ) : (
                <>
                  <input type="email" value={form.recipientEmail} onChange={e => setForm({ ...form, recipientEmail: e.target.value })} placeholder="Recipient email" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm"/>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Personal message (optional)" rows={2} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm resize-none"/>
                </>
              )}
              <div className="flex gap-2">
                <button onClick={() => setBuyOpen(false)} className="flex-1 btn-ghost text-sm">Cancel</button>
                <button onClick={purchase} disabled={!form.amount || parseFloat(form.amount) <= 0} className="flex-1 btn-primary text-sm">
                  Buy ${parseFloat(form.amount || '0').toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}

        {sendOpen && (
          <div className="mb-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Send Gift Card</h2>
              <button onClick={() => setSendOpen(false)} className="text-2xl leading-none text-[var(--color-text-muted)] hover:text-[var(--color-text)]">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <input type="number" min={1} step={5} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount (USD)" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-center text-lg font-bold"/>
              <input type="email" value={form.recipientEmail} onChange={e => setForm({ ...form, recipientEmail: e.target.value })} placeholder="Recipient email" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm"/>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Personal message (optional)" rows={2} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm resize-none"/>
              <div className="flex gap-2">
                <button onClick={() => setSendOpen(false)} className="flex-1 btn-ghost text-sm">Cancel</button>
                <button onClick={send} disabled={!form.recipientEmail || !form.amount || parseFloat(form.amount) <= 0} className="flex-1 btn-primary text-sm">
                  Send ${parseFloat(form.amount || '0').toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards list */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Your Gift Cards</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/></div>
            ) : cards.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/5"><span className="text-2xl">🎁</span></div>
                <p className="mt-4 text-sm font-medium text-[var(--color-text)]">No gift cards yet</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Buy or send a gift card to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map(card => (
                  <div key={card.id} className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-[var(--color-primary)]/10 p-2">
                          <span className="text-xl">🎁</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-text)]">{card.code}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {card.status} · {card.recipientEmail ? `Sent to ${card.recipientEmail}` : 'Personal'}
                            {card.message && ` · "${card.message}"`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[var(--color-primary)]">${card.amountUsd}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{new Date(card.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">How it works</h2>
            <div className="space-y-3 text-sm text-[var(--color-text)]">
              <div className="rounded-lg bg-[var(--color-bg)] p-3">
                <p className="font-semibold">1. Choose amount</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-1">Any amount from $10 to $500. Perfect for birthdays, holidays, or client gifts.</p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg)] p-3">
                <p className="font-semibold">2. Send or keep</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-1">Send by email or keep it for yourself. Redeemable for any CongoConnect booking.</p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg)] p-3">
                <p className="font-semibold">3. Recipient redeems</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-1">Gift card code can be applied to any flight, hotel, cargo, or package booking.</p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg)] p-3">
                <p className="font-semibold">4. No expiry</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-1">Gift cards never expire. Use them anytime for your next trip.</p>
              </div>
            </div>
            <button onClick={() => setBuyOpen(true)} className="mt-4 w-full btn-gold text-sm">Buy a Gift Card</button>
            <button onClick={() => setSendOpen(true)} className="mt-2 w-full btn-outline text-sm">Send to Someone</button>
          </div>
        </div>
      </div>
    </div>
  );
}
