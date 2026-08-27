import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as nodeCrypto from "crypto";
import { prisma } from "@/lib/db";
import { setSession, clearSession, signSession } from "@/lib/session";

const BCRYPT_ROUNDS = 10;
const LEGACY_PREFIX = "$legacy$";

// Legacy SHA-256 hashing (used by pre-existing seeded accounts). We detect it and
// transparently upgrade those accounts to bcrypt on first successful login.
const legacyHash = (pw: string) =>
  LEGACY_PREFIX +
  nodeCrypto.createHash("sha256").update("nx::" + pw).digest("hex");

async function verifyPassword(stored: string, password: string): Promise<boolean> {
  // New bcrypt hashes
  if (stored.startsWith("$2")) {
    return bcrypt.compare(password, stored);
  }
  // Legacy SHA-256 (pre-existing seeded accounts): 64-char hex of sha256("nx::"+pw)
  if (/^[a-f0-9]{64}$/.test(stored)) {
    return stored === legacyHash(password).replace(LEGACY_PREFIX, "");
  }
  return false;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function publicUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: `${u.firstName} ${u.lastName}`,
    role: u.role,
    walletBalanceUsd: u.walletBalanceUsd,
    firstName: u.firstName,
    lastName: u.lastName,
  };
}

// Register
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, password, firstName, lastName, phone } = body ?? {};
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "email, password, firstName and lastName are required" }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      phone: phone ?? null,
    },
  });

  const res = NextResponse.json({ data: publicUser(user) }, { status: 201 });
  return setSession(res, { userId: user.id, role: user.role, iat: Math.floor(Date.now() / 1000) });
}

// Login
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
    include: { paymentMethods: true },
  });
  if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Transparently upgrade legacy SHA-256 hashes to bcrypt.
  if (/^[a-f0-9]{64}$/.test(user.passwordHash)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(body.password) },
    });
  }

  const data = {
    ...publicUser(user),
    paymentMethods: (user.paymentMethods || []).map((m: any) => ({
      kind: m.kind,
      label: m.label,
      isDefault: m.isDefault,
    })),
  };
  const res = NextResponse.json({ data });
  return setSession(res, { userId: user.id, role: user.role, iat: Math.floor(Date.now() / 1000) });
}

// Logout
export async function DELETE() {
  const res = NextResponse.json({ data: { ok: true } });
  return clearSession(res);
}
