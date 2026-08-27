import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { notifyUser } from '@/lib/notifications/delivery';

// POST /api/account/request-verify - Issue an email-verification token and "send" it.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const token = randomBytes(24).toString('hex');
  await prisma.verificationToken.create({
    data: { userId: user.id, type: 'email_verify', token, expiresAt: new Date(Date.now() + 24 * 3600 * 1000) },
  });

  const result = await notifyUser({
    userId: user.id,
    type: 'email_verify',
    title: 'Verify your CongoConnect email',
    message: `Your verification token: ${token}`,
    email: user.email,
    channels: ['email'],
  });

  const emailStatus = result.deliveries.find((d) => d.channel === 'email')?.status ?? 'skipped';
  const response: any = { data: { sent: emailStatus !== 'not_configured', emailStatus } };
  if (emailStatus === 'not_configured') response.devToken = token;
  return NextResponse.json(response, { status: 201 });
}
