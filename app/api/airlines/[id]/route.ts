import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/airlines/[id] - Get airline details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const airline = await prisma.airline.findUnique({
    where: { id },
    include: {
      aircraft: { orderBy: { registration: 'asc' } },
      flights: { orderBy: { flightNo: 'asc' } },
    },
  });
  if (!airline) return NextResponse.json({ error: 'Airline not found' }, { status: 404 });
  return NextResponse.json({ data: airline });
}

// PUT /api/airlines/[id] - Update airline
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const airline = await prisma.airline.update({
    where: { id },
    data: {
      name: body.name,
      country: body.country,
      logo: body.logo,
      website: body.website,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      status: body.status,
    },
  });
  return NextResponse.json({ data: airline });
}

// DELETE /api/airlines/[id] - Delete airline
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.airline.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
