import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomBytes } from '@/lib/crypto';

export async function GET() {
  const tickets = await prisma.complaint.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, reference: true, type: true, priority: true, status: true,
      summary: true, createdAt: true,
    },
  });
  return NextResponse.json({ data: tickets });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.summary || !body?.email) {
    return NextResponse.json({ error: 'summary and email are required' }, { status: 400 });
  }
  const ref = `CS-${randomBytes(3).toString('hex').toUpperCase()}${Date.now() % 10000}`;
  const ticket = await prisma.complaint.create({
    data: {
      reference: ref,
      userId: 'system',
      type: body.type ?? 'general',
      priority: body.priority ?? 'normal',
      status: 'open',
      summary: body.summary,
      customerMessage: body.message ?? null,
      assignedToEmail: body.email,
      category: body.category ?? null,
    },
  });
  return NextResponse.json({ data: ticket }, { status: 201 });
}
