import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/airport-ops/gates - All gates
export async function GET(req: NextRequest) {
  const gates = await prisma.airportGate.findMany({
    include: {
      terminal: { select: { code: true, name: true } },
    },
    orderBy: { code: 'asc' },
  });
  return NextResponse.json({ data: gates, total: gates.length });
}

// POST /api/airport-ops/gates - Create gate
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.terminalId || !body?.code) {
    return NextResponse.json({ error: 'terminalId and code required' }, { status: 400 });
  }

  const gate = await prisma.airportGate.create({
    data: {
      terminalId: body.terminalId,
      code: body.code,
      status: body.status || 'available',
      aircraftType: body.aircraftType,
    },
  });
  return NextResponse.json({ data: gate }, { status: 201 });
}
