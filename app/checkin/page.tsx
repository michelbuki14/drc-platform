'use client';

import { useState } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

export default function CheckInIndexPage() {
  const { t } = useI18n();
  const [ticketNo, setTicketNo] = useState('');

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
              <span className="text-sm text-[var(--color-text-muted)]">Check-in</span>
            </div>
            <div className="flex gap-2">
              <Link href="/trips" className="btn-ghost text-xs">My Trips</Link>
              <Link href="/" className="btn-ghost text-xs">← Home</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <span className="text-2xl">🛫</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">Online Check-in</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Check in for your flight or track your boarding status
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <input
              type="text"
              value={ticketNo}
              onChange={(e) => setTicketNo(e.target.value)}
              placeholder="Ticket number (e.g. TK-2024-ABC1)"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm"
            />
            <div className="flex gap-2">
              <Link
                href={`/checkin/${ticketNo || 'TK'}`}
                className="btn-primary text-sm flex-1"
              >
                Check in
              </Link>
              <Link
                href={`/checkin/${ticketNo || 'TK'}/status`}
                className="btn-ghost-outline text-sm"
              >
                Status only
              </Link>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Enter your ticket number from your booking confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
