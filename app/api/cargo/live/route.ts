import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/cargo/live - Live cargo tracking
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const trackingNo = searchParams.get('trackingNo');

  if (trackingNo) {
    const cargo = await prisma.cargo.findUnique({
      where: { trackingNo },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 50,
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

  // List all active cargo shipments
  const shipments = await prisma.cargo.findMany({
    where: {
      status: { not: 'delivered' },
    },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ data: shipments });
}

