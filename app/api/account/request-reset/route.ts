import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { notifyUser } from '@/lib/notifications/delivery';

// POST /api/account/request-reset - Issue a password-reset token and "send" it.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  // Always behave the same to avoid user enumeration.
  if (!user) {
    return NextResponse.json({ data: { queued: true, emailStatus: 'not_configured' } }, { status: 201 });
  }

  const token = randomBytes(24).toString('hex');
  await prisma.verificationToken.create({
    data: { userId: user.id, type: 'password_reset', token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const result = await notifyUser({
    userId: user.id,
    type: 'password_reset',
    title: 'Reset your CongoConnect password',
    message: `Your password reset token: ${token}`,
    email: user.email,
    channels: ['email'],
  });
  const emailStatus = result.deliveries.find((d) => d.channel === 'email')?.status ?? 'skipped';
  const response: any = { data: { queued: true, emailStatus } };
  if (emailStatus === 'not_configured') response.devToken = token;
  return NextResponse.json(response, { status: 201 });
}
