import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/airport-ops/terminals - All terminals
export async function GET(req: NextRequest) {
  const terminals = await prisma.airportTerminal.findMany({
    include: {
      airport: { select: { code: true, name: true } },
      _count: { select: { gates: true } },
    },
    orderBy: { code: 'asc' },
  });
  return NextResponse.json({ data: terminals, total: terminals.length });
}

// POST /api/airport-ops/terminals - Create terminal
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.airportId || !body?.code || !body?.name) {
    return NextResponse.json({ error: 'airportId, code, and name required' }, { status: 400 });
  }

  const terminal = await prisma.airportTerminal.create({
    data: {
      airportId: body.airportId,
      code: body.code,
      name: body.name,
    },
  });
  return NextResponse.json({ data: terminal }, { status: 201 });
}
