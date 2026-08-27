import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

// POST /api/account/reset - Set a new password using a reset token.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { token, password } = body ?? {};
  if (!token || !password) return NextResponse.json({ error: 'token and password required' }, { status: 400 });
  if (String(password).length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.type !== 'password_reset') return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  if (vt.usedAt) return NextResponse.json({ error: 'Token already used' }, { status: 410 });
  if (vt.expiresAt < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 410 });

  await prisma.$transaction([
    prisma.user.update({ where: { id: vt.userId }, data: { passwordHash: await bcrypt.hash(password, 10) } }),
    prisma.verificationToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ data: { reset: true } });
}
