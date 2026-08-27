import * as nodeCrypto from 'crypto';

// Export the full Node.js crypto namespace for backward compatibility
// (routes that do `import { crypto } from '@/lib/crypto'` and call crypto.randomBytes)
export { nodeCrypto as crypto };

// Convenience helpers
export function randomBytes(n: number): Buffer {
  return nodeCrypto.randomBytes(n);
}

export function sha256(message: string): string {
  return nodeCrypto.createHash('sha256').update(message).digest('hex');
}

/** V4 UUID (RFC 4122 variant) */
export function uuid4(): string {
  const b = nodeCrypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10
  const hex = b.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
