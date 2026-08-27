import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./db";

/**
 * Lightweight, dependency-free session layer.
 *
 * On successful login we issue a signed, httpOnly cookie containing the user's
 * id and role. Protected routes call `requireUser()` / `requireRole()` to read it.
 * This replaces the previous pattern where the client supplied its own `userId`,
 * which allowed any caller to impersonate another user.
 */

const COOKIE_NAME = "cc_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET is not set. Set it in your environment for production.");
    }
    // Dev-only insecure fallback — never reaches production (above guard).
    return "dev-insecure-session-secret-change-me";
  }
  return secret;
}

function base64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export interface Session {
  userId: string;
  role: string;
  // issued-at (seconds)
  iat: number;
}

export function signSession(session: Session): string {
  const payload = base64url(Buffer.from(JSON.stringify(session)));
  const sig = base64url(
    createHmac("sha256", getSecret()).update(payload).digest()
  );
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): Session | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = base64url(
    createHmac("sha256", getSecret()).update(payload).digest()
  );
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(fromBase64url(payload).toString()) as Session;
    return data;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE,
    },
  };
}

export function clearCookieOptions() {
  return { name: COOKIE_NAME, value: "", options: { httpOnly: true, path: "/", maxAge: 0 } };
}

/** Read the session from a request (cookie or Authorization: Bearer). */
export function getSession(req: NextRequest): Session | null {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  return verifySession(cookie || bearer);
}

/** Apply the session cookie to a response. */
export function setSession(res: NextResponse, session: Session) {
  const c = sessionCookie(signSession(session));
  res.cookies.set(c.name, c.value, c.options as any);
  return res;
}

export function clearSession(res: NextResponse) {
  const c = clearCookieOptions();
  res.cookies.set(c.name, c.value, c.options as any);
  return res;
}

/** 401 helper for unauthenticated requests. */
export function unauthorized() {
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
}

/**
 * Require an authenticated user. Returns the session, or a NextResponse error
 * that the caller should return early.
 */
export function requireUser(req: NextRequest): Session | NextResponse {
  const session = getSession(req);
  if (!session) return unauthorized();
  return session;
}

/** Require a specific role (or one of several). */
export function requireRole(req: NextRequest, roles: string | string[]): Session | NextResponse {
  const session = getSession(req);
  if (!session) return unauthorized();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.role)) return forbidden();
  return session;
}

/** Load the full user record for the current session (or null). */
export async function currentUser(req: NextRequest) {
  const session = getSession(req);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}
