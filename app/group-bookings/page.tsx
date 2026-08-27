'use client';

import { useState, useEffect } from 'react';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface GroupBooking {
  id: string;
  reference: string;
  name: string;
  description: string;
  status: string;
  totalUsd: number;
  createdAt: string;
  members: GroupMember[];
}

export default function GroupBookingsPage() {
  const [bookings, setBookings] = useState<GroupBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBooking, setNewBooking] = useState({ name: '', description: '', members: [{ name: '', email: '', phone: '' }], totalUsd: 0 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroupBookings();
  }, []);

  const fetchGroupBookings = async () => {
    try {
      const res = await fetch('/api/group-bookings?limit=50');
      const data = await res.json();
      setBookings(data.data || []);
    } catch (e) {
      console.error('Failed to fetch group bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/group-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_test001', ...newBooking }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings([data.data, ...bookings]);
        setNewBooking({ name: '', description: '', members: [{ name: '', email: '', phone: '' }], totalUsd: 0 });
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to create group booking:', e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Group Bookings</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Create and manage group travel bookings</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Create form */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Create Group Booking</h2>
          <form onSubmit={handleSubmit} className="card card-elevated max-w-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Group Name</label>
              <input
                type="text"
                value={newBooking.name}
                onChange={e => setNewBooking({ ...newBooking, name: e.target.value })}
                className="input w-full"
                placeholder="Family Reunion, Corporate Trip, etc."
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Description</label>
              <textarea
                value={newBooking.description}
                onChange={e => setNewBooking({ ...newBooking, description: e.target.value })}
                className="input w-full h-20"
                placeholder="Trip details..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Total Budget (USD)</label>
              <input
                type="number"
                value={newBooking.totalUsd}
                onChange={e => setNewBooking({ ...newBooking, totalUsd: parseFloat(e.target.value) || 0 })}
                className="input w-full"
                placeholder="0"
              />
            </div>
            <button type="submit" disabled={creating} className="btn-primary w-full py-2 font-semibold rounded-lg disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Group Booking'}
            </button>
          </form>
        </section>

        {/* Existing bookings */}
        <section>
          <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">My Group Bookings ({bookings.length})</h2>
          {bookings.length === 0 ? (
            <p className="text-center py-12 text-[var(--color-text-muted)]">No group bookings yet. Create your first one above.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map(group => (
                <div key={group.id} className="card card-elevated p-5">
                  <h3 className="font-semibold text-[var(--color-primary)]">{group.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">{group.reference}</p>
                  {group.description && <p className="text-sm mt-2 text-[var(--color-text-muted)]">{group.description}</p>}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>{group.members.length} members</span>
                    <span className="font-semibold">${group.totalUsd}</span>
                  </div>
                  <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                    {new Date(group.createdAt).toLocaleDateString()}
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
