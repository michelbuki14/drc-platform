import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET /api/ops/dispatch - All dispatches
export async function GET(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const dispatches = await prisma.flightDispatch.findMany({
    include: {
      aircraft: { select: { registration: true, type: true } },
    },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json({ data: dispatches, total: dispatches.length });
}

// POST /api/ops/dispatch - Create dispatch
export async function POST(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const body = await req.json().catch(() => null);
  if (!body?.flightNo || !body?.date) {
    return NextResponse.json({ error: 'flightNo and date required' }, { status: 400 });
  }

  const dispatch = await prisma.flightDispatch.create({
    data: {
      flightNo: body.flightNo,
      date: new Date(body.date),
      aircraftId: body.aircraftId,
      captainId: body.captainId,
      foId: body.foId,
      status: body.status || 'planned',
      fuelKg: body.fuelKg,
      payloadKg: body.payloadKg,
      weather: body.weather,
      notes: body.notes,
    },
  });
  return NextResponse.json({ data: dispatch }, { status: 201 });
}
