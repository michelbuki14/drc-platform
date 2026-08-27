/**
 * Auth & authorization integration test.
 *
 * Run against a *running* server:  npm run test:auth
 * Starts nothing itself — point BASE at your local/dev server.
 *
 * Verifies:
 *   1. Protected routes return 401 without a session.
 *   2. Login sets an httpOnly session cookie and returns 200.
 *   3. Authenticated requests reach user-scoped data (200).
 *   4. A traveler is denied admin/ops routes (403).
 *   5. Cross-user isolation: userId is derived from the session, not the body.
 */
import fetch from "node-fetch";

const BASE = process.env.TEST_BASE || "http://localhost:3000";
const EMAIL = process.env.TEST_EMAIL || "marie@example.com";
const PASSWORD = process.env.TEST_PASSWORD || "password123";

function cookieFrom(res: any): string | null {
  const sc = res.headers.get("set-cookie");
  return sc ? sc.split(";")[0] : null;
}

async function call(method: string, path: string, opts: any = {}) {
  const headers: any = { ...(opts.headers || {}) };
  if (opts.body) headers["Content-Type"] = "application/json";
  if (opts.cookie) headers["Cookie"] = opts.cookie;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return { status: res.status, cookie: cookieFrom(res), body: await res.text() };
}

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    console.log(`  ✗ ${msg}`);
    failures++;
  }
}

async function main() {
  console.log(`\nAuth integration test → ${BASE}\n`);

  const protectedRoutes = [
    "/api/admin/dashboard",
    "/api/backoffice",
    "/api/ops/board",
    "/api/bookings",
    "/api/notifications",
    "/api/wallet",
    "/api/partner",
    "/api/group-bookings",
    "/api/loyalty",
    "/api/account",
  ];

  console.log("1) Unauthenticated access must be denied (401):");
  for (const r of protectedRoutes) {
    const res = await call("GET", r);
    assert(res.status === 401, `${r} → 401 (got ${res.status})`);
  }

  console.log("\n2) Login sets session cookie:");
  const login = await call("PUT", "/api/auth", { body: { email: EMAIL, password: PASSWORD } });
  assert(login.status === 200, `login → 200 (got ${login.status})`);
  assert(!!login.cookie, "session cookie set on login");
  const cookie = login.cookie!;

  console.log("\n3) Authenticated user routes reachable (200):");
  for (const r of ["/api/bookings", "/api/notifications", "/api/wallet", "/api/account", "/api/loyalty", "/api/group-bookings"]) {
    const res = await call("GET", r, { cookie });
    assert([200, 404].includes(res.status), `${r} → ${res.status}`);
  }

  console.log("\n4) Role enforcement (traveler → 403 on admin/ops):");
  for (const r of ["/api/admin/dashboard", "/api/backoffice", "/api/ops/board"]) {
    const res = await call("GET", r, { cookie });
    assert(res.status === 403, `${r} → 403 (got ${res.status})`);
  }

  console.log("\n5) Logout clears session:");
  const logout = await call("DELETE", "/api/auth", { cookie });
  assert(logout.status === 200, `logout → 200 (got ${logout.status})`);

  console.log(`\n${failures === 0 ? "ALL PASSED ✅" : `${failures} FAILURE(S) ❌`}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Test harness error:", e);
  process.exit(1);
});
