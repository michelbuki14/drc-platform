import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET /api/ops/crew-schedules - All crew schedules
export async function GET(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const schedules = await prisma.crewSchedule.findMany({
    include: {
      crew: { select: { firstName: true, lastName: true, role: true, employeeNo: true } },
    },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json({ data: schedules, total: schedules.length });
}

// POST /api/ops/crew-schedules - Create crew schedule
export async function POST(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const body = await req.json().catch(() => null);
  if (!body?.crewId || !body?.flightNo || !body?.date) {
    return NextResponse.json({ error: 'crewId, flightNo, and date required' }, { status: 400 });
  }

  const schedule = await prisma.crewSchedule.create({
    data: {
      crewId: body.crewId,
      flightNo: body.flightNo,
      date: new Date(body.date),
      role: body.role || 'crew',
      status: body.status || 'scheduled',
    },
  });
  return NextResponse.json({ data: schedule }, { status: 201 });
}
