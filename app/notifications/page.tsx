'use client';

import { useState, useEffect } from 'react';

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 'usr_test001'; // Demo user

  useEffect(() => {
    fetch(`/api/notifications?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        setNotifications(d.data || []);
        setLoading(false);
      });
  }, []);

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Notifications</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Stay updated with your bookings and alerts</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`card card-elevated p-4 cursor-pointer transition-all ${n.read ? 'opacity-60' : 'border-l-4 border-l-[var(--color-primary)]'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-primary)]">{n.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text)]">{n.message}</p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />}
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-center text-[var(--color-text-muted)] py-12">No notifications yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}