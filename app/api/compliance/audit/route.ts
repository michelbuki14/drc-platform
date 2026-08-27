import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const actor = req.nextUrl.searchParams.get('actor');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');

  const where = actor ? { actor } : {};
  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ data: logs });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { actor, actorRole, action, target, detail, ipAddress } = body ?? {};

  if (!actor || !action || !target) {
    return NextResponse.json({ error: 'actor, action, target required' }, { status: 400 });
  }

  const log = await prisma.auditLog.create({
    data: {
      actor,
      actorRole: actorRole ?? 'system',
      action,
      target,
      detail: detail ? JSON.stringify(detail) : null,
      ipAddress: ipAddress ?? '127.0.0.1',
    },
  });

  return NextResponse.json({ data: log });
}
