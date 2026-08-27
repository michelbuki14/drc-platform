'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsSettingsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications?email=notif@test.com')
      .then(r => r.json())
      .then(data => setNotifications(data.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{t('notifications.title') || 'Notification Settings'}</h1>
        <p className="text-[var(--color-muted)] mb-6">{t('notifications.subtitle') || 'Manage how you receive updates about your trips and bookings'}</p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:bg-[var(--color-card)]/50 transition">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]" />
            <span className="text-[var(--color-foreground)]">Email notifications for booking confirmations</span>
          </label>
          <label className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:bg-[var(--color-card)]/50 transition">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]" />
            <span className="text-[var(--color-foreground)]">SMS alerts for flight status changes</span>
          </label>
          <label className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:bg-[var(--color-card)]/50 transition">
            <input type="checkbox" className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]" />
            <span className="text-[var(--color-foreground)]">Push notifications for price drop alerts</span>
          </label>
          <label className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:bg-[var(--color-card)]/50 transition">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]" />
            <span className="text-[var(--color-foreground)]">Weekly travel deals digest</span>
          </label>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4">Recent Notifications</h2>
          {loading && <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--color-primary)] border-t-transparent mx-auto"></div></div>}
          {!loading && notifications.length === 0 && <p className="text-[var(--color-muted)] text-center">No notifications yet</p>}
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 border rounded ${n.read ? 'opacity-50' : 'bg-[var(--color-card)]/50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-[var(--color-muted)] uppercase">{n.type}</span>
                    <h3 className="font-medium text-[var(--color-foreground)]">{n.title}</h3>
                    <p className="text-sm text-[var(--color-muted)]">{n.message}</p>
                  </div>
                  {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-[var(--color-primary)] hover:underline">Mark read</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
