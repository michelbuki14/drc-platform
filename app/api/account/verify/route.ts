import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/account/request-verify  -> see app/api/account/request-verify/route.ts
// PUT  /api/account/verify         -> consume an email-verification token.
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.type !== 'email_verify') return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  if (vt.usedAt) return NextResponse.json({ error: 'Token already used' }, { status: 410 });
  if (vt.expiresAt < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 410 });

  await prisma.$transaction([
    prisma.user.update({ where: { id: vt.userId }, data: { emailVerified: true } }),
    prisma.verificationToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ data: { verified: true } });
}
