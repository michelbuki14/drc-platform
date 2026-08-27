'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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
  updatedAt: string;
  members: GroupMember[];
}

export default function GroupBookingDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      fetch(`/api/group-bookings/${groupId}`)
        .then(r => r.json())
        .then(d => {
          setGroup(d.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [groupId]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;
  if (!group) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[var(--color-text-muted)]">Group not found</p></div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">{group.name}</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{group.reference}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Details */}
          <div className="card card-elevated p-6">
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Details</h2>
            {group.description && <p className="text-[var(--color-text)]">{group.description}</p>}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Status</span>
                <span className="font-semibold capitalize">{group.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Total Budget</span>
                <span className="font-semibold">${group.totalUsd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Created</span>
                <span>{new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
              {group.updatedAt && <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Updated</span>
                <span>{new Date(group.updatedAt).toLocaleDateString()}</span>
              </div>}
            </div>
          </div>

          {/* Members */}
          <div className="card card-elevated p-6">
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Members ({group.members.length})</h2>
            {group.members.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No members added yet.</p>
            ) : (
              <ul className="space-y-2">
                {group.members.map(member => (
                  <li key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg)]">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{member.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
