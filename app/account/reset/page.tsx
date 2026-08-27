'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetInner() {
  const params = useSearchParams();
  const presetToken = params.get('token') || '';
  const [token, setToken] = useState(presetToken);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    if (!token || !password) { setMsg('Token and new password required.'); setStatus('error'); return; }
    setStatus('loading');
    const r = await fetch('/api/account/reset', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setStatus('ok'); setMsg('Password updated. You can now log in.'); }
    else { setStatus('error'); setMsg(d.error || 'Reset failed.'); }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-center text-xl font-bold text-[var(--color-text)]">Reset Password</h1>
      <div className="card card-elevated mt-6 space-y-4 p-6">
        <input className="input w-full" placeholder="Reset token" value={token} onChange={e => setToken(e.target.value)} />
        <input type="password" className="input w-full" placeholder="New password (min 6)" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={submit} disabled={status === 'loading'} className="btn-primary w-full py-2 disabled:opacity-50">
          {status === 'loading' ? 'Updating…' : 'Update Password'}
        </button>
        {msg && <p className={`text-sm ${status === 'ok' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>{msg}</p>}
      </div>
      <div className="mt-4 text-center">
        <Link href="/account" className="text-sm text-[var(--color-text-muted)]">Back to Account</Link>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-[var(--color-text-muted)]">Loading…</div>}>
      <ResetInner />
    </Suspense>
  );
}
