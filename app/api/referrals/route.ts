import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

// GET /api/referrals - List referrals
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const where = { userId };

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.referral.count({ where }),
  ]);

  return NextResponse.json({ data: referrals, total, page, limit });
}
