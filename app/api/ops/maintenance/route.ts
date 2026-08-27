import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET /api/ops/maintenance - All maintenance records
export async function GET(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const records = await prisma.aircraftMaintenance.findMany({
    include: {
      aircraft: { select: { registration: true, type: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });
  return NextResponse.json({ data: records, total: records.length });
}

// POST /api/ops/maintenance - Create maintenance record
export async function POST(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const body = await req.json().catch(() => null);
  if (!body?.aircraftId || !body?.type || !body?.description || !body?.scheduledAt) {
    return NextResponse.json({ error: 'aircraftId, type, description, scheduledAt required' }, { status: 400 });
  }

  const record = await prisma.aircraftMaintenance.create({
    data: {
      aircraftId: body.aircraftId,
      type: body.type,
      description: body.description,
      status: body.status || 'scheduled',
      scheduledAt: new Date(body.scheduledAt),
      technician: body.technician,
      notes: body.notes,
    },
  });
  return NextResponse.json({ data: record }, { status: 201 });
}
