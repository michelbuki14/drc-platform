import { createHash } from 'crypto';
import { prisma } from '@/lib/db';

/**
 * Hash sensitive data for storage (HIPAA de-identification)
 */
export function hashPII(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Validate consent before processing PHI
 */
export function hasValidConsent(consent: { consent: boolean; expiresAt?: Date | null } | null): boolean {
  if (!consent || !consent.consent) return false;
  if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) return false;
  return true;
}

/**
 * Apply data minimization — strip PII from logs
 */
export function minimizeForLog<T extends Record<string, unknown>>(data: T, allowedFields: string[]): Record<string, unknown> {
  const minimized: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in data) {
      minimized[field] = data[field];
    }
  }
  return minimized;
}

/**
 * Audit trail helper — record PHI access
 */
export async function auditAccess(params: {
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  detail?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      actor: params.actor,
      actorRole: params.actorRole,
      action: params.action,
      target: params.target,
      detail: params.detail ? JSON.stringify(params.detail) : null,
      ipAddress: params.ipAddress ?? '127.0.0.1',
    },
  });
}

/**
 * Data retention — check if a record is past retention period
 */
export function isPastRetention(createdAt: Date, retentionDays: number): boolean {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  return createdAt < cutoff;
}

/**
 * Validate that a data subject request is authorized
 */
export async function validateDSRA(email: string, requesterEmail: string): Promise<{ valid: boolean; error?: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { valid: false, error: 'User not found' };
  if (user.email !== requesterEmail.toLowerCase()) {
    return { valid: false, error: 'Unauthorized: can only request your own data' };
  }
  return { valid: true };
}
