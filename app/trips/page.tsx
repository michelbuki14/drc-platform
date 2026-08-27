'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

interface Ticket {
  id: string;
  ticketNo: string;
  passengerName: string;
  seat: string | null;
  cabinClass: string;
  flightNo: string;
  originCode: string;
  destinationCode: string;
  departDate: string;
  idType: string;
  documentNo: string;
  nationality: string;
  ageCategory: string;
  status: string;
  issuedAt: string;
  checkInStatus: string;
  booking: {
    reference: string;
    email: string;
    passengerName: string;
    flight: {
      origin: { name: string };
      destination: { name: string };
    };
  };
}

function statusColor(status: string) {
  if (status === 'checked_in') return 'text-[var(--color-success)]';
  if (status === 'boarding') return 'text-[var(--color-accent)]';
  if (status === 'used') return 'text-[var(--color-warning)]';
  return 'text-[var(--color-text-muted)]';
}

function statusLabel(status: string) {
  if (status === 'issued') return 'Issued';
  if (status === 'checked_in') return 'Check-in done';
  if (status === 'boarding') return 'Boarding';
  if (status === 'used') return 'Flown';
  if (status === 'voided') return 'Voided';
  return status;
}

export default function TripsPage() {
  const [ref, setRef] = useState('');
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const lookup = useCallback(async () => {
    if (!ref && !email) return;
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (ref) qs.set('ref', ref);
      if (email) qs.set('email', email);
      const res = await fetch(`/api/tickets?${qs.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Could not look up tickets');
        setTickets([]);
      } else {
        const json = await res.json();
        setTickets(json.data || []);
      }
    } catch {
      setError('Network error — could not reach the server');
    } finally {
      setLoading(false);
    }
  }, [ref, email]);

  const voidTicket = useCallback(async (ticketNo: string) => {
    if (!confirm(`Void ticket ${ticketNo}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/tickets?ticketNo=${ticketNo}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error || 'Could not void ticket');
      } else {
        setTickets((prev) =>
          prev.map((t) => (t.ticketNo === ticketNo ? { ...t, status: 'voided' as const } : t))
        );
      }
    } catch {
      alert('Network error');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">
                  C
                </span>
                <span className="text-base font-bold text-[var(--color-primary)]">
                  Congo<span className="text-[var(--color-accent)]">Connect</span>
                </span>
              </Link>
              <span className="h-4 w-px bg-[var(--color-border)] hidden sm:block"/>
              <span className="text-sm text-[var(--color-text-muted)] hidden sm:block">
                My Trips / Boarding Passes
              </span>
            </div>
            <Link href="/" className="btn-ghost text-sm">
              ← New search
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[var(--max-width-content)] px-4 pt-6 pb-4">
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-4 sm:p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)]">
            Find your boarding pass
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Look up by booking reference or email. Your QR code boarding pass will be ready to scan at the gate.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                Booking reference (e.g. BK-A1B2C3)
              </label>
              <input
                className="input w-full"
                placeholder="BK-A1B2C3"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && lookup()}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                Email (your account email)
              </label>
              <input
                className="input w-full"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookup()}
              />
            </div>
            <button
              type="button"
              onClick={lookup}
              disabled={!ref && !email || loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? 'Looking up…' : 'Find my trips'}
            </button>
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
              {error}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[var(--max-width-content)] px-4 pb-12">
        {tickets.length === 0 && !loading && !error && (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/5">
              <svg className="h-6 w-6 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--color-text)]">
              No tickets found
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Enter a booking reference or your email above to look up your boarding passes.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/>
          </div>
        )}

        {tickets.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <article key={ticket.id} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex w-full sm:w-56 flex-col items-center justify-center bg-[var(--color-primary-navy)] p-5 sm:p-6 text-white">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/60">
                        {ticket.originCode} → {ticket.destinationCode}
                      </p>
                      <QRCodeSVG
                        id={`qr-${ticket.ticketNo}`}
                        value={`CongoConnect://ticket/${ticket.ticketNo}?ref=${ticket.booking.reference}&p=${encodeURIComponent(ticket.passengerName)}&f=${ticket.flightNo}&o=${ticket.originCode}&d=${ticket.destinationCode}`}
                        size={120}
                        level="H"
                        bgColor="#0B2545"
                        fgColor="#D4AF37"
                        includeMargin
                      />
                      <p className="mt-2 text-[10px] text-white/70 text-center leading-relaxed">
                        Scan at the gate
                      </p>
                      <div className="mt-3 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const qrSvg = document.querySelector<SVGSVGElement>(`#qr-${ticket.ticketNo}`);
                            if (!qrSvg) return;
                            const svgData = new XMLSerializer().serializeToString(qrSvg);
                            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${ticket.ticketNo}-boarding-pass.svg`;
                            a.click();
                            setTimeout(() => URL.revokeObjectURL(url), 1000);
                          }}
                          className="rounded-lg bg-white/10 px-3 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-white/20"
                        >
                          Save QR image
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                            {ticket.cabinClass === 'C' ? 'Business Class' : 'Economy Class'}
                          </p>
                          <p className="mt-0.5 font-display text-xl font-bold text-[var(--color-text)]">
                            {ticket.flightNo}
                          </p>
                          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                            {ticket.booking.flight.origin.name} → {ticket.booking.flight.destination.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor(ticket.status)}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${ticket.status === 'used' ? 'bg-[var(--color-warning)]' : ticket.status === 'checked_in' || ticket.status === 'boarding' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]'}`}/>
                            {statusLabel(ticket.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-2 text-xs text-left sm:grid-cols-2 lg:grid-cols-3 sm:text-sm">
                        <div className="rounded-lg bg-[var(--color-bg)]/50 p-3">
                          <p className="text-[10px] font-semibold text-[var(--color-text-muted)]">Passenger</p>
                          <p className="mt-0.5 font-semibold text-[var(--color-text)]">{ticket.passengerName}</p>
                          <p className="mt-0.5 text-[var(--color-text-muted)]">{ticket.nationality} · {ticket.ageCategory}</p>
                        </div>
                        <div className="rounded-lg bg-[var(--color-bg)]/50 p-3">
                          <p className="text-[10px] font-semibold text-[var(--color-text-muted)]">Document</p>
                          <p className="mt-0.5 font-semibold text-[var(--color-text)]">{ticket.idType}</p>
                          <p className="mt-0.5 text-[var(--color-text-muted)]">{ticket.documentNo || '—'}</p>
                        </div>
                        <div className="rounded-lg bg-[var(--color-bg)]/50 p-3">
                          <p className="text-[10px] font-semibold text-[var(--color-text-muted)]">Seat</p>
                          <p className="mt-0.5 font-semibold text-[var(--color-text)]">{ticket.seat || '—'}</p>
                          <p className="mt-0.5 text-[var(--color-text-muted)]">Booking ref: {ticket.booking.reference}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ticket.checkInStatus === 'none' && ticket.status !== 'voided' && ticket.status !== 'used' && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/tickets', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ticketNo: ticket.ticketNo, seat: ticket.seat }),
                                });
                                if (!res.ok) {
                                  const body = await res.json().catch(() => ({}));
                                  alert(body.error || 'Check-in failed');
                                } else {
                                  setTickets((prev) =>
                                    prev.map((t) =>
                                      t.ticketNo === ticket.ticketNo
                                        ? { ...t, status: 'checked_in' as const, checkInStatus: 'checked_in' as const }
                                        : t
                                    )
                                  );
                                }
                              } catch {
                                alert('Network error');
                              }
                            }}
                            className="btn-sm btn-gold-outline"
                          >
                            Check in
                          </button>
                        )}
                        {ticket.status !== 'voided' && ticket.status !== 'used' && (
                          <button
                            type="button"
                            onClick={() => voidTicket(ticket.ticketNo)}
                            className="btn-sm bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20"
                          >
                            Void ticket
                          </button>
                        )}
                        {ticket.status === 'voided' && (
                          <span className="rounded-lg bg-[var(--color-error)]/10 px-3 py-1 text-xs font-medium text-[var(--color-error)]">
                            Voided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
