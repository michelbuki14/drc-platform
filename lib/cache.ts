/**
 * Lightweight TTL cache with an optional Redis backend.
 *
 * In-process Map by default. If REDIS_URL / UPSTASH_REDIS_REST_URL is set, uses
 * Redis so the cache is shared across instances. Used to shield the DB from
 * repeated identical reads (search, analytics, listings).
 */

import { createHmac } from 'crypto';

type CacheBackend =
  | { kind: 'memory'; store: Map<string, { value: any; exp: number }> }
  | { kind: 'redis'; get: (k: string) => Promise<string | null>; set: (k: string, v: string, ttl: number) => Promise<void> };

function hashKey(key: string): string {
  return createHmac('sha256', 'cc-cache').update(key).digest('hex').slice(0, 32);
}

function memoryBackend(): CacheBackend {
  return { kind: 'memory', store: new Map() };
}

let backend: CacheBackend | null = null;

async function getBackend(): Promise<CacheBackend> {
  if (backend) return backend;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  if (url) {
    try {
      const res = await fetch(url.replace(/\/$/, '') + '/PING', {
        headers: url.includes('upstash') ? { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } : {},
      });
      if (res.ok) {
        backend = {
          kind: 'redis',
          get: async (k) => {
            const r = await fetch(url.replace(/\/$/, '') + '/GET/' + encodeURIComponent(k), {
              headers: url.includes('upstash') ? { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } : {},
            });
            const j = await r.json();
            return j.result ?? null;
          },
          set: async (k, v, ttl) => {
            await fetch(url.replace(/\/$/, '') + `/SET/${encodeURIComponent(k)}/${ttl}/${encodeURIComponent(v)}`, {
              headers: url.includes('upstash') ? { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } : {},
            });
          },
        };
        return backend;
      }
    } catch {
      // fall through to memory
    }
  }
  backend = memoryBackend();
  return backend;
}

export async function withCache<T>(key: string, build: () => Promise<T>, ttlMs = 30000): Promise<T> {
  const hk = hashKey(key);
  const b = await getBackend();
  try {
    if (b.kind === 'memory') {
      const hit = b.store.get(hk);
      if (hit && hit.exp > Date.now()) return hit.value as T;
    } else {
      const raw = await b.get(hk);
      if (raw) return JSON.parse(raw) as T;
    }
  } catch {
    // ignore cache read errors
  }
  const value = await build();
  try {
    if (b.kind === 'memory') {
      b.store.set(hk, { value, exp: Date.now() + ttlMs });
    } else {
      await b.set(hk, JSON.stringify(value), Math.ceil(ttlMs / 1000));
    }
  } catch {
    // ignore cache write errors
  }
  return value;
}
