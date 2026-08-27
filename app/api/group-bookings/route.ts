import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/group-bookings - List all group bookings
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const where = userId ? { userId } : {};

  const [bookings, total] = await Promise.all([
    prisma.groupBooking.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { members: true },
    }),
    prisma.groupBooking.count({ where }),
  ]);

  return NextResponse.json({ data: bookings, total, page, limit });
}

// POST /api/group-bookings - Create a group booking
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.members?.length) {
    return NextResponse.json({ error: 'name, members required' }, { status: 400 });
  }

  const reference = 'GRP-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  const group = await prisma.groupBooking.create({
    data: {
      reference,
      userId: session.userId,
      name: body.name,
      email: body.email || '',
      description: body.description,
      status: 'active',
      totalUsd: body.totalUsd || 0,
      members: {
        create: body.members.map((m: any) => ({
          name: m.name,
          email: m.email,
          phone: m.phone,
        })),
      },
    },
    include: { members: true, user: true },
  });

  return NextResponse.json({ data: group }, { status: 201 });
}
