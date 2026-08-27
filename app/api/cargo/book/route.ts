import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => ({}));
  const { trackingNo, origin, destination, weightKg, valueUsd, senderName, senderPhone, recipientName, recipientPhone, contents } = payload || {};
  if (!trackingNo || !origin || !destination) {
    return NextResponse.json({ error: 'trackingNo, origin, destination required' }, { status: 400 });
  }
  const tracking = await prisma.cargo.create({
    data: {
      trackingNo,
      origin,
      destination,
      status: 'pending',
      contents: contents || 'General cargo',
      weightKg: weightKg ? Number(weightKg) : 0,
      valueUsd: valueUsd ? Number(valueUsd) : 0,
      senderName: senderName || null,
      senderPhone: senderPhone || null,
      recipientName: recipientName || null,
      recipientPhone: recipientPhone || null,
    },
  });
  return NextResponse.json({ success: true, cargo: tracking }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('trackingNo');
  if (id) {
    const cargo = await prisma.cargo.findUnique({ where: { trackingNo: id } });
    if (!cargo) return NextResponse.json({ error: 'Cargo not found' }, { status: 404 });
    return NextResponse.json({ cargo });
  }
  // Return all cargo if no trackingNo
  const cargo = await prisma.cargo.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ data: cargo, count: cargo.length });
}
