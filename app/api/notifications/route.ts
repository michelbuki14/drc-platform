import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyUser } from '@/lib/notifications/delivery';

// GET /api/notifications - Get the authenticated user's notifications
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unread = notifications.filter((n: any) => !n.read).length;
  return NextResponse.json({ data: notifications, total: notifications.length, unread });
}

// POST /api/notifications - Create + deliver a notification
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => null);
  if (!body?.type || !body?.title || !body?.message) {
    return NextResponse.json({ error: 'type, title, message required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const result = await notifyUser({
    userId: session.userId,
    type: body.type,
    title: body.title,
    message: body.message,
    data: body.data,
    email: user.email,
    phone: user.phone ?? undefined,
    channels: Array.isArray(body.channels) ? body.channels : [],
  });

  return NextResponse.json(
    { data: result.notification, deliveries: result.deliveries },
    { status: 201 }
  );
}

// PUT /api/notifications - Mark one or all as read (owner-checked)
export async function PUT(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => null);
  const { notificationId, all } = body || {};

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: session.userId, read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true, marked: 'all' });
  }

  if (!notificationId) {
    return NextResponse.json({ error: 'notificationId or all required' }, { status: 400 });
  }
  // Ownership check
  const existing = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
  return NextResponse.json({ success: true });
}
