/**
 * Configurable rate limiter.
 *
 * - If Upstash Redis env vars are present (UPSTASH_REDIS_REST_URL + token), it
 *   uses a shared, multi-instance-safe sliding window.
 * - Otherwise it falls back to an in-process sliding-window store (fine for a
 *   single Node instance / local dev). This is more correct than the previous
 *   fixed counter because it evicts old hits.
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface Bucket {
  hits: number[];
}

const WINDOW_MS = 60_000;
const memory = new Map<string, Bucket>();

function memoryCheck(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const bucket = memory.get(key) ?? { hits: [] };
  // Drop hits outside the window
  bucket.hits = bucket.hits.filter((t) => now - t < WINDOW_MS);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    return { success: false, remaining: 0, resetAt: oldest + WINDOW_MS };
  }
  bucket.hits.push(now);
  memory.set(key, bucket);
  return { success: true, remaining: Math.max(0, limit - bucket.hits.length), resetAt: now + WINDOW_MS };
}

export async function rateLimit(key: string, limit: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await upstashCheck(key, limit, url, token);
    } catch {
      // fall back to memory if Redis is unreachable
    }
  }
  return memoryCheck(key, limit);
}

async function upstashCheck(
  key: string,
  limit: number,
  url: string,
  token: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const res = await fetch(`${url}/zadd/rl_${key}/${now}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify([now]),
  });
  if (!res.ok) throw new Error("upstash zadd failed");
  // Remove entries older than the window
  await fetch(`${url}/zremrangebyscore/rl_${key}/0/${now - WINDOW_MS}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const countRes = await fetch(`${url}/zcard/rl_${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const count = (await countRes.json()).result as number;
  const success = count <= limit;
  if (!success) {
    // roll back the added entry for this rejected request
    await fetch(`${url}/zrem/rl_${key}/${now}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  return { success, remaining: Math.max(0, limit - count), resetAt: now + WINDOW_MS };
}
