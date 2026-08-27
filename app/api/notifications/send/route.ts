import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyUser } from '@/lib/notifications/delivery';

// POST /api/notifications/send - Create a notification and push it to configured channels
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.message) {
    return NextResponse.json({ error: 'title, message required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const result = await notifyUser({
    userId: session.userId,
    type: body.type || 'push',
    title: body.title,
    message: body.message,
    data: body.data,
    email: user.email,
    phone: user.phone ?? undefined,
    // Attempt all out-of-band channels; each degrades to not_configured if unconfigured.
    channels: ['email', 'sms', 'push'],
  });

  return NextResponse.json(
    {
      data: result.notification,
      deliveries: result.deliveries,
      note: 'In-app notification stored. External channels require provider credentials (see .env.example).',
    },
    { status: 201 }
  );
}
