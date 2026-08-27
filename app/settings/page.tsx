'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function SettingsPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  // Preferences are local-only (persisted to localStorage) — safe demo state
  const [prefs, setPrefs] = useState({
    notifications: true,
    marketing: false,
    currency: 'USD',
    language: 'en',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cc-prefs');
      if (raw) setPrefs(p => ({ ...p, ...JSON.parse(raw) }));
    } catch {}
  }, []);

  const save = (key: string, val: any) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    try { localStorage.setItem('cc-prefs', JSON.stringify(next)); } catch {}
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[var(--max-width-content)] items-center justify-between px-4 py-3">
          <Link href="/account" className="btn-ghost text-xs">← Account</Link>
          <h1 className="text-sm font-semibold text-[var(--color-text)]">Settings</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-20">
        <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Preferences</h2>

          <div className="mt-4 space-y-4">
            <Toggle label="Push notifications" desc="Flight, gate & baggage alerts" value={prefs.notifications} onChange={v => save('notifications', v)} />
            <Toggle label="Marketing emails" desc="Deals and product updates" value={prefs.marketing} onChange={v => save('marketing', v)} />

            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Currency</label>
              <select value={prefs.currency} onChange={e => save('currency', e.target.value)} className="input mt-1">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CDF">CDF (FC)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Language</label>
              <select value={prefs.language} onChange={e => save('language', e.target.value)} className="input mt-1">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ln">Lingála</option>
              </select>
            </div>
          </div>
        </section>

        <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
          Signed in as {user?.email || 'guest'} · Preferences saved locally
        </p>
      </div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
