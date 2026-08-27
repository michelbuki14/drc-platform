import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/referrals/refer - Create a referral
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const code = 'REF-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  const referral = await prisma.referral.create({
    data: {
      code,
      userId: session.userId,
      referredEmail: body.referredEmail,
    },
  });

  return NextResponse.json({ data: referral, code }, { status: 201 });
}
