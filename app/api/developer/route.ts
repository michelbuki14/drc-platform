import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ data: null }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ data: null }, { status: 404 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id, status: 'active' },
    orderBy: { createdAt: 'desc' },
  });

  const totalCalls = await prisma.apiUsage.count({
    where: { apiKeyId: { in: keys.map(k => k.id) } },
  });

  return NextResponse.json({
    data: {
      keys,
      totalCalls,
      plan: 'developer',
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, name } = body ?? {};
  if (!email || !name) return NextResponse.json({ error: 'email and name required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const key = 'CCK_' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      key,
      name,
      permissions: JSON.stringify({ read: true, write: false }),
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    data: {
      keyId: apiKey.id,
      name: apiKey.name,
      key,
      status: apiKey.status,
      expiresAt: apiKey.expiresAt,
      warning: 'Store this key securely. It will not be shown again.',
    },
  }, { status: 201 });
}
