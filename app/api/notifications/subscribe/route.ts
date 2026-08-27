import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/notifications/subscribe - Persist a Web Push subscription
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => null);
  const { endpoint, keys } = body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'endpoint and keys.p256dh/keys.auth required' }, { status: 400 });
  }

  const sub = await prisma.pushSubscription.upsert({
    where: { userId_endpoint: { userId: session.userId, endpoint } },
    update: { p256dh: keys.p256dh, auth: keys.auth },
    create: {
      userId: session.userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ data: { subscribed: true, id: sub.id } }, { status: 201 });
}

// DELETE /api/notifications/subscribe - Remove a subscription
export async function DELETE(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const { endpoint } = await req.json().catch(() => ({}));
  if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 });
  await prisma.pushSubscription.deleteMany({ where: { userId: session.userId, endpoint } });
  return NextResponse.json({ success: true });
}
