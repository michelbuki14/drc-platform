import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET /api/admin/users - User management (admin only)
export async function GET(req: NextRequest) {
  const session = requireRole(req, 'admin');
  if (session instanceof NextResponse) return session;

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  const where = search ? {
    OR: [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ],
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { bookings: true, payments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ data: users, total, page, limit });
}
