import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const active = await prisma.flashDeal.findMany({
    where: { status: 'active', validTo: { gte: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: active });
}
