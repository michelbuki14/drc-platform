'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useAuth } from '@/components/AuthProvider';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

interface BoardingPass {
  id: string;
  ticketNo: string;
  flightNo: string;
  seat: string | null;
  cabinClass: string;
  originCode: string;
  destinationCode: string;
  departDate: string;
  qrString: string;
}

interface CheckInResult {
  ticket: {
    ticketNo: string;
    passengerName: string;
    seat: string | null;
    cabinClass: string;
    flightNo: string;
    originCode: string;
    destinationCode: string;
    departDate: string;
  };
  checkIn: {
    id: string;
    seat: string | null;
    cabinClass: string;
    status: string;
    checkInAt: string;
    baggageCount: number;
    specialRequests: string | null;
  } | null;
  boardingPass: BoardingPass | null;
}

export default function CheckInPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [ticketNo, setTicketNo] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    if (!ticketNo) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/checkin?ticketNo=${encodeURIComponent(ticketNo)}`);
      if (res.ok) setResult((await res.json()).data);
      else setError('Ticket not found');
    } finally { setLoading(false); }
  };

  const doCheckIn = async () => {
    if (!ticketNo) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketNo }),
      });
      const data = await res.json();
      if (res.ok || (res.status === 409 && data.data)) {
        setResult(data.data);
        if (res.status === 409) setError('Already checked in — showing your boarding pass.');
      } else {
        setError(data.error || 'Check-in failed');
      }
    } finally { setLoading(false); }
  };

  const bp = result?.boardingPass || null;

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
              <span className="text-sm text-[var(--color-text-muted)]">Online Check-in</span>
            </div>
            <Link href="/" className="btn-ghost text-xs">← Home</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <span className="text-2xl">🛫</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">Check in online</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Enter your ticket number to check in and get your boarding pass</p>
        </div>

        <div className="flex gap-2 mb-6 max-w-md mx-auto">
          <input
            type="text"
            value={ticketNo}
            onChange={(e) => setTicketNo(e.target.value)}
            placeholder="Ticket number (e.g. TK-...)"
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm"
          />
          <button type="button" onClick={lookup} className="btn-ghost-outline text-sm whitespace-nowrap">Lookup</button>
          <button type="button" onClick={doCheckIn} className="btn-primary text-sm whitespace-nowrap">Check-in</button>
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-[var(--color-warning)]">{error}</p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          </div>
        )}

        {bp && (
          <div className="mx-auto mb-6 max-w-sm rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
            <p className="mb-3 text-center text-sm font-semibold text-[var(--color-text)]">Your Boarding Pass</p>
            <div className="flex justify-center rounded-xl bg-white p-4">
              <QRCodeSVG value={bp.qrString} size={200} level="M" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-xs text-[var(--color-text-muted)]">Passenger</p><p className="font-semibold text-[var(--color-text)]">{result?.ticket.passengerName}</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)]">Flight</p><p className="font-semibold text-[var(--color-text)]">{bp.flightNo}</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)]">Route</p><p className="font-semibold text-[var(--color-text)]">{bp.originCode} → {bp.destinationCode}</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)]">Seat</p><p className="font-semibold text-[var(--color-text)]">{bp.seat || '—'}</p></div>
            </div>
            <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">Scan at the gate · signed &amp; verifiable</p>
          </div>
        )}

        {result && !bp && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-sm">
                {result.ticket.ticketNo.slice(0, 3)}
              </span>
              <div>
                <p className="text-base font-bold text-[var(--color-text)]">{result.ticket.ticketNo}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{result.ticket.passengerName}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-3 text-center">
                <p className="text-xs text-[var(--color-text-muted)]">Flight</p>
                <p className="mt-1 font-semibold text-[var(--color-text)]">{result.ticket.flightNo}</p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-3 text-center">
                <p className="text-xs text-[var(--color-text-muted)]">Route</p>
                <p className="mt-1 font-semibold text-[var(--color-text)]">{result.ticket.originCode} → {result.ticket.destinationCode}</p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-3 text-center">
                <p className="text-xs text-[var(--color-text-muted)]">Departure</p>
                <p className="mt-1 font-semibold text-[var(--color-text)]">{new Date(result.ticket.departDate).toLocaleString()}</p>
              </div>
              {result.checkIn && (
                <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center text-sm text-[var(--color-text-muted)] col-span-full">
                  Checked in at {new Date(result.checkIn.checkInAt).toLocaleString()} · Baggage: {result.checkIn.baggageCount} bags
                </div>
              )}
            </div>
          </div>
        )}

        {!result && !loading && !bp && (
          <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
            Enter a ticket number above to look up your check-in status.
          </div>
        )}
      </div>
    </div>
  );
}
