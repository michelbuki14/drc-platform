import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// GET /api/cargo/live/[trackingNo] - Specific cargo tracking
export async function GET(req: NextRequest, { params }: { params: Promise<{ trackingNo: string }> }) {
  const { trackingNo } = await params;

  const cargo = await prisma.cargo.findUnique({
    where: { trackingNo },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
      },
      insurance: true,
      customs: true,
    },
  });

  if (!cargo) {
    return NextResponse.json({ error: 'Cargo not found' }, { status: 404 });
  }

  return NextResponse.json({ data: cargo });
}