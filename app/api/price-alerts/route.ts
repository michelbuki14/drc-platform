import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/price-alerts - List price alerts
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;
  const userId = session.userId;

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const where = { userId };

  const [alerts, total] = await Promise.all([
    prisma.priceAlert.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { flight: true },
    }),
    prisma.priceAlert.count({ where }),
  ]);

  return NextResponse.json({ data: alerts, total, page, limit });
}

// POST /api/price-alerts/create - Create a price alert
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.flightId || !body?.targetPriceUsd) {
    return NextResponse.json({ error: 'flightId, targetPriceUsd required' }, { status: 400 });
  }

  const alert = await prisma.priceAlert.create({
      data: {
        userId: (requireUser(req) as any).userId,
        flightId: body.flightId,
        targetPriceUsd: body.targetPriceUsd,
        origin: body.origin || '',
        destination: body.destination || '',
      },
      include: { flight: true },
    });

  return NextResponse.json({ data: alert }, { status: 201 });
}
