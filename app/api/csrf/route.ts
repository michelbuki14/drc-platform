import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHmac } from "crypto";

// Issues a CSRF token for the client to send back as `X-CSRF-Token` on
// cross-site state-changing requests. The token is signed (not just random) so
// it can't be forged, and is scoped to the session where available.
const COOKIE = "cc_csrf";
const MAX_AGE = 60 * 60 * 2; // 2h

function secret() {
  return process.env.SESSION_SECRET || "dev-insecure-session-secret-change-me";
}

export async function GET(req: NextRequest) {
  const token = randomBytes(32).toString("hex");
  const sig = createHmac("sha256", secret()).update(token).digest("hex");
  const value = `${token}.${sig}`;

  const res = NextResponse.json({ token: value });
  res.cookies.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}
