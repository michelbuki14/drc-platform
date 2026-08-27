'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Lounge {
  id: string;
  name: string;
  airportId: string;
  location: string;
  access: string;
  priceUsd: number;
  amenities: string | null;
}

function LoungeCard({lounge, onBook}: {lounge: Lounge; onBook: (l: Lounge) => void}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{lounge.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{lounge.location}</p>
        </div>
        <span className="text-lg font-bold text-[var(--color-primary)]">${lounge.priceUsd}</span>
      </div>
      {lounge.amenities && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{lounge.amenities}</p>
      )}
      <p className="mt-2 text-xs text-[var(--color-accent)] font-medium">Access: {lounge.access}</p>
      <button
        type="button"
        onClick={() => onBook(lounge)}
        className="mt-3 w-full btn-gold text-xs"
      >
        Book Lounge
      </button>
    </div>
  );
}

export default function LoungesPage() {
  const { t } = useI18n();
  const [airportId, setAirportId] = useState('');
  const [lounges, setLounges] = useState<Lounge[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingForm, setBookingForm] = useState({ email: '', flightNo: '', date: '', guests: '1' });

  const fetchLounges = useCallback(async () => {
    setLoading(true);
    const url = airportId ? `/api/lounges?airportId=${encodeURIComponent(airportId)}` : '/api/lounges';
    try {
      const res = await fetch(url);
      if (res.ok) setLounges((await res.json()).data);
    } finally { setLoading(false); }
  }, [airportId]);

  useEffect(() => { fetchLounges(); }, [fetchLounges]);

  const handleBook = async (lounge: Lounge) => {
    setBooking(true);
    setBooked(false);
    try {
      const res = await fetch('/api/lounges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bookingForm.email,
          loungeId: lounge.id,
          flightNo: bookingForm.flightNo,
          date: bookingForm.date,
          guests: parseInt(bookingForm.guests, 10) || 1,
        }),
      });
      if (res.ok) setBooked(true);
    } catch { /* ignore */ } finally { setBooking(false); }
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
              <span className="text-sm text-[var(--color-text-muted)]">Airport Lounges</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={airportId}
                onChange={(e) => setAirportId(e.target.value)}
                placeholder="Airport code (FIH, LUB...)"
                className="w-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs"
              />
              <Link href="/" className="btn-ghost text-xs">← Home</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/>
          </div>
        ) : lounges.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">No lounges found for this airport</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lounges.map((l) => <LoungeCard key={l.id} lounge={l} onBook={handleBook}/>)}
          </div>
        )}

        {booking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/60 backdrop-blur-sm">
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-xl max-w-sm w-full">
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Book Lounge</h2>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                  placeholder="Your email"
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm"
                />
                <input
                  type="text"
                  value={bookingForm.flightNo}
                  onChange={(e) => setBookingForm({...bookingForm, flightNo: e.target.value})}
                  placeholder="Flight number"
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm"
                />
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-text-muted)]">Guests:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({...bookingForm, guests: e.target.value})}
                    className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2 text-sm text-center"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBooking(false)}
                    className="flex-1 btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleBook(lounges[0]); }}
                    disabled={!bookingForm.email || !bookingForm.flightNo || !bookingForm.date}
                    className="flex-1 btn-primary text-sm"
                  >
                    {booking ? 'Booking…' : 'Confirm'}
                  </button>
                </div>
                {booked && (
                  <p className="text-sm text-[var(--color-success)] text-center">Lounge booking confirmed!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
