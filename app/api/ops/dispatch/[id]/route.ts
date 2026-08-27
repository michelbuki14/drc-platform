import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET /api/ops/dispatch/[id] - Get dispatch details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dispatch = await prisma.flightDispatch.findUnique({
    where: { id },
    include: { aircraft: true },
  });
  if (!dispatch) return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 });
  return NextResponse.json({ data: dispatch });
}

// PUT /api/ops/dispatch/[id] - Update dispatch
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const dispatch = await prisma.flightDispatch.update({
    where: { id },
    data: {
      status: body.status,
      fuelKg: body.fuelKg,
      payloadKg: body.payloadKg,
      weather: body.weather,
      notes: body.notes,
    },
  });
  return NextResponse.json({ data: dispatch });
}
