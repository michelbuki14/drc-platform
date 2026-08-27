import { requireRole } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { publishCargoUpdate } from '@/lib/realtime/hub';

// POST /api/cargo/status - Update a shipment's status and broadcast to live subscribers.
// Restricted to ops/admin roles.
export async function POST(req: NextRequest) {
  const session = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const { trackingNo, status, location, note } = body ?? {};
  if (!trackingNo || !status) {
    return NextResponse.json({ error: 'trackingNo and status required' }, { status: 400 });
  }

  const cargo = await prisma.cargo.findUnique({ where: { trackingNo } });
  if (!cargo) return NextResponse.json({ error: 'Cargo not found' }, { status: 404 });

  const updated = await prisma.cargo.update({
    where: { trackingNo },
    data: { status, ...(status === 'delivered' ? { deliveredAt: new Date() } : {}) },
  });

  if (location || note) {
    await prisma.cargoEvent.create({
      data: { cargoId: cargo.id, status, location: location ?? '', note: note ?? null },
    });
  }

  // Broadcast to SSE subscribers
  publishCargoUpdate(trackingNo, { ...updated, location, note, at: new Date().toISOString() });

  return NextResponse.json({ data: updated });
}
