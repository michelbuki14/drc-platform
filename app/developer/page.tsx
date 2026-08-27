'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: string;
  permissions: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function DeveloperPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('dcuser@congoconnect.cd');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);
  const [creating, setCreating] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/developer?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setKeys(data.data?.keys || []);
        setTotalCalls(data.data?.totalCalls ?? 0);
      }
    } finally { setLoading(false); }
  }, [email]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    setCreating(true);
    try {
      const res = await fetch('/api/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: newKeyName }),
      });
      if (res.ok) {
        const data = await res.json();
        const k: ApiKey = {
          id: data.data.keyId,
          name: data.data.name,
          key: data.data.key,
          status: data.data.status,
          permissions: data.data.permissions || '{}',
          lastUsedAt: null,
          expiresAt: data.data.expiresAt,
          createdAt: new Date().toISOString(),
        };
        setCreatedKey(k);
        setNewKeyName('');
        const refresh = await fetch(`/api/developer?email=${encodeURIComponent(email)}`);
        if (refresh.ok) {
          const d = await refresh.json();
          setKeys(d.data?.keys || []);
          setTotalCalls(d.data?.totalCalls ?? 0);
        }
      }
    } finally { setCreating(false); }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).catch(() => {});
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
              <span className="text-sm text-[var(--color-text-muted)]">Developer Portal</span>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="w-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs"
              />
              <Link href="/" className="btn-ghost text-xs">← Home</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 pb-16">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">API Keys</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">{keys.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Total Calls</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-accent)]">{totalCalls}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Plan</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-success)]">Developer</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"/>
          </div>
        ) : keys.length === 0 && !createdKey ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/5">
              <span className="text-2xl">🔑</span>
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--color-text)]">No API keys yet</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Create a key to access CongoConnect APIs</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold text-xs">
                    {k.name.slice(0, 3).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{k.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        k.status === 'active' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'
                      }`}>{k.status}</span>
                      {k.expiresAt && <span className="text-xs text-[var(--color-text-muted)]">Expires {new Date(k.expiresAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKey(showKey === k.id ? null : k.id)}
                    className="text-xs text-[var(--color-primary)] hover:underline"
                  >
                    {showKey === k.id ? 'Hide' : 'Show'} Key
                  </button>
                  {showKey === k.id && (
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={k.key}
                        className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs font-mono text-[var(--color-text)]"
                      />
                      <button
                        type="button"
                        onClick={() => copyKey(k.key)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                      >
                        📋
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {createdKey && (
              <div className="rounded-2xl border border-dashed border-[var(--color-warning)] bg-[var(--color-warning)]/5 p-4 text-center">
                <p className="text-sm font-medium text-[var(--color-warning)]">🔐 New key created — save it now</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <code className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm font-mono text-[var(--color-text)]">
                    {createdKey.key}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyKey(createdKey.key)}
                    className="btn-primary text-xs"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  This key will not be shown again. Store it securely.
                </p>
                <button
                  type="button"
                  onClick={() => setCreatedKey(null)}
                  className="mt-3 btn-ghost text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Create New API Key</h2>
          <form onSubmit={createKey} className="flex flex-col gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. Mobile app, Web dashboard)"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !newKeyName}
                className="btn-primary text-sm whitespace-nowrap"
              >
                {creating ? 'Creating…' : 'Create Key'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/50 p-5 text-sm text-[var(--color-text-muted)]">
          <p><strong>Rate limits:</strong> 100 calls/hour for Developer plan. Use the key in the Authorization header.</p>
        </div>
      </div>
    </div>
  );
}
