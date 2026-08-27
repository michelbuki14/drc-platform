'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMsg('No verification token provided.'); return; }
    (async () => {
      setStatus('loading');
      const r = await fetch('/api/account/verify', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setStatus('ok'); setMsg('Your email is now verified.'); }
      else { setStatus('error'); setMsg(d.error || 'Verification failed.'); }
    })();
  }, [token]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-xl font-bold text-[var(--color-text)]">Email Verification</h1>
      {status === 'loading' && <p className="mt-4 text-sm text-[var(--color-text-muted)]">Verifying…</p>}
      {status === 'ok' && <p className="mt-4 text-sm text-[var(--color-success)]">{msg}</p>}
      {status === 'error' && <p className="mt-4 text-sm text-[var(--color-danger)]">{msg}</p>}
      <Link href="/account" className="btn-primary mt-6 inline-block px-6 py-2">Go to Account</Link>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-[var(--color-text-muted)]">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
