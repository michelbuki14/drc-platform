import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

// GET /api/loyalty - Get user's loyalty points
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;

  const loyalty = await prisma.loyaltyPoints.findUnique({
    where: { userId },
    include: {},
  });

  return NextResponse.json({ data: loyalty });
}
