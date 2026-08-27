import { createHmac } from "crypto";

/**
 * Boarding-pass QR payloads.
 *
 * The QR encodes a compact, signed JSON object so a gate scanner can verify
 * authenticity offline (recompute the HMAC with the server secret and compare).
 * We keep the payload small so it renders reliably as a QR code even on low-end
 * devices.
 */

export interface BoardingPassData {
  ticketNo: string;
  passenger: string;
  flightNo: string;
  seat: string | null;
  cabin: string;
  from: string;
  to: string;
  depart: string; // ISO
  gate?: string | null;
  group?: string | null;
}

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-session-secret-change-me";
}

export function signBoardingPass(data: BoardingPassData): { payload: string; signature: string } {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return { payload, signature };
}

export function verifyBoardingPass(payload: string, signature: string): BoardingPassData | null {
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  // constant-time compare
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !a.equals(b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as BoardingPassData;
  } catch {
    return null;
  }
}

/** The string that should be rendered into the QR code (payload.signature). */
export function boardingPassQrString(data: BoardingPassData): string {
  const { payload, signature } = signBoardingPass(data);
  return `${payload}.${signature}`;
}
