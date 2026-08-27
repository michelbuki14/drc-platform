'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Itinerary {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  status: string;
  items: any[];
  createdAt: string;
}

export default function ItineraryPage() {
  const { t } = useI18n();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createResult, setCreateResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/itineraries?userId=usr_test001')
      .then(r => r.json())
      .then(data => setItineraries(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const createItin = async () => {
    if (!newTitle) return;
    try {
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_test001',
          title: newTitle,
          description: newDesc || null,
          isPublic: false,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setCreateResult({ id: data.data.id, title: data.data.title });
        setItineraries(prev => [data.data, ...prev]);
        setNewTitle('');
        setNewDesc('');
      }
    } catch { /* ignore */ }
  };

  const openItin = (id: string) => setActiveId(id);

  const activeItin = itineraries.find(i => i.id === activeId);

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
              <span className="text-sm text-[var(--color-text-muted)]">Itinerary Builder</span>
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
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Build Your Trip</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Combine flights, hotels, cars, tours, and activities into one itinerary</p>
        </div>

        {/* Create form */}
        {activeId === null && (
          <div className="mb-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">New Itinerary</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Kinshasa → Goma Business Trip"
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm"
              />
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setNewTitle('')} className="flex-1 btn-ghost text-sm">Cancel</button>
                <button
                  onClick={createItin}
                  disabled={!newTitle}
                  className="flex-1 btn-primary text-sm"
                >
                  Create Itinerary
                </button>
              </div>
              {createResult && (
                <div className="rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 p-3 text-center">
                  <p className="text-sm font-semibold text-[var(--color-success)]">✅ "{createResult.title}" created</p>
                  <button onClick={() => setCreateResult(null)} className="mt-2 btn-ghost-outline text-xs">Close</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active itinerary editor */}
        {activeId && activeItin && (
          <div className="mb-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">{activeItin.title}</h2>
                {activeItin.description && <p className="text-sm text-[var(--color-text-muted)]">{activeItin.description}</p>}
              </div>
              <button onClick={() => setActiveId(null)} className="btn-ghost text-sm">← Back to list</button>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">
                Items ({activeItin.items.length})
              </h3>
              {activeItin.items.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                  No items yet. Add flights, hotels, cars, tours, or activities below.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeItin.items.map((item: any) => (
                    <div key={item.id} className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-[var(--color-text)]">{item.title}</p>
                          {item.subtitle && <p className="text-xs text-[var(--color-text-muted)]">{item.subtitle}</p>}
                          <div className="mt-1 flex gap-2 text-xs text-[var(--color-text-muted)]">
                            {item.type && <span>🏷️ {item.type}</span>}
                            {item.date && <span>📅 {item.date}</span>}
                            {item.time && <span>🕐 {item.time}</span>}
                            {item.duration && <span>⏱ {item.duration}</span>}
                            {item.location && <span>📍 {item.location}</span>}
                            {item.costUsd > 0 && <span>💰 ${item.costUsd}</span>}
                          </div>
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {item.order !== undefined && `Order: ${item.order}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-[var(--color-bg)] p-3 text-center text-sm">
              <span className="text-[var(--color-text-muted)]">
                {activeItin.items.length} item{activeItin.items.length !== 1 ? 's' : ''} · Status: {activeItin.status}
                {activeItin.isPublic && ' · 🌐 Public'}
              </span>
            </div>
          </div>
        )}

        {/* Itinerary list */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">
              {activeId === null ? 'Your Itineraries' : 'All Itineraries'}
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/>
              </div>
            ) : itineraries.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/5">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="mt-4 text-sm font-medium text-[var(--color-text)]">No itineraries yet</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Create one above to start planning your trip</p>
              </div>
            ) : (
              <div className="space-y-3">
                {itineraries.map(itin => (
                  <div
                    key={itin.id}
                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                      activeId === itin.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                        : 'border-[var(--color-border-subtle)] bg-[var(--color-bg)]'
                    }`}
                    onClick={() => openItin(itin.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--color-text)]">{itin.title}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {itin.items.length} items · {itin.status}
                          {itin.isPublic && ' · 🌐 Public'}
                        </p>
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {new Date(itin.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {itin.description && (
                      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{itin.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">How it works</h2>
            <div className="space-y-3 text-sm text-[var(--color-text)]">
              <div className="rounded-lg bg-[var(--color-bg)] p-3">
                <p className="font-semibold">1. Create</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-1">Give your trip a name and description.</p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg)] p-3">
                <p className="font-semibold">2. Add items</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-1">Combine flights, hotels, cars, tours, and activities.</p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg)] p-3">
                <p className="font-semibold">3. Share</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-1">Make it public or share the link with travel companions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
