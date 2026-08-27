'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [devToken, setDevToken] = useState('');

  const submit = async () => {
    if (!email) { setMsg('Email required.'); setStatus('error'); return; }
    setStatus('loading');
    const r = await fetch('/api/account/request-reset', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setStatus('done');
      setMsg(d.data?.emailStatus === 'not_configured'
        ? 'No email provider configured. Use the dev link below to simulate the reset email.'
        : 'If that email exists, a reset link has been sent.');
      setDevToken(d.devToken || '');
    } else {
      setStatus('error'); setMsg(d.error || 'Request failed.');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-center text-xl font-bold text-[var(--color-text)]">Forgot Password</h1>
      <div className="card card-elevated mt-6 space-y-4 p-6">
        <input className="input w-full" placeholder="Your account email" value={email} onChange={e => setEmail(e.target.value)} />
        <button onClick={submit} disabled={status === 'loading'} className="btn-primary w-full py-2 disabled:opacity-50">
          {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
        </button>
        {msg && <p className="text-sm text-[var(--color-text-muted)]">{msg}</p>}
        {devToken && (
          <Link href={`/account/reset?token=${devToken}`} className="btn-ghost-outline block w-full py-2 text-center text-sm">
            Open dev reset link
          </Link>
        )}
      </div>
      <div className="mt-4 text-center">
        <Link href="/account" className="text-sm text-[var(--color-text-muted)]">Back to Account</Link>
      </div>
    </div>
  );
}
