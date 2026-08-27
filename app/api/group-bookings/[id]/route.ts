import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/group-bookings/[id] - Get group booking details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const group = await prisma.groupBooking.findUnique({
    where: { id },
    include: { members: true },
  });

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  return NextResponse.json({ data: group });
}

// PUT /api/group-bookings/[id] - Update group booking
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const group = await prisma.groupBooking.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      status: body.status,
      totalUsd: body.totalUsd,
    },
    include: { members: true },
  });

  return NextResponse.json({ data: group });
}

// DELETE /api/group-bookings/[id] - Delete group booking
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await prisma.groupBooking.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
