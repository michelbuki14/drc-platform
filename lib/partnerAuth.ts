import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Partner API-key authentication.
 *
 * External partners call /api/partner/v1/* with `Authorization: Bearer pk_xxx`.
 * We resolve the key, verify it's active and unexpired, attribute it to the
 * owning partner, and record usage. Returns a NextResponse (401/403) on failure
 * so callers can `if (r instanceof NextResponse) return r`.
 */
export interface PartnerAuth {
  apiKeyId: string;
  partnerId: string;
  permissions: string[];
}

export async function requirePartnerKey(req: NextRequest): Promise<PartnerAuth | NextResponse> {
  const auth = req.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(pk_[A-Za-z0-9]+)$/);
  if (!match) {
    return NextResponse.json({ error: 'Missing or malformed partner API key' }, { status: 401 });
  }
  const key = match[1];
  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  if (apiKey.status !== 'active') return NextResponse.json({ error: 'API key revoked' }, { status: 403 });
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return NextResponse.json({ error: 'API key expired' }, { status: 403 });

  // Record usage (fire-and-forget)
  const start = Date.now();
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  prisma.apiUsage.create({
    data: { apiKeyId: apiKey.id, endpoint: req.nextUrl.pathname, method: req.method, statusCode: 200, responseTimeMs: Date.now() - start },
  }).catch(() => {});

  const permissions = (apiKey.permissions || 'read,write').split(',').map((p) => p.trim());
  return { apiKeyId: apiKey.id, partnerId: apiKey.userId, permissions };
}

export function canWrite(auth: PartnerAuth): boolean {
  return auth.permissions.includes('write') || auth.permissions.includes('*');
}
