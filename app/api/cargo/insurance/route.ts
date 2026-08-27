import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const trackingNo = req.nextUrl.searchParams.get('trackingNo');
  const insId = req.nextUrl.searchParams.get('insId');

  // Fetch insurance by cargo ID
  if (insId) {
    const insurance = await prisma.cargoInsurance.findMany({
      where: { cargoId: insId },
      orderBy: { createdAt: 'desc' },
    });
    if (insurance.length === 0) return NextResponse.json({ data: [] });
    return NextResponse.json({ data: insurance });
  }

  // Fetch cargo + events by tracking number
  if (trackingNo) {
    const cargo = await prisma.cargo.findUnique({ where: { trackingNo } });
    if (!cargo) return NextResponse.json({ data: null, message: 'Cargo not found' }, { status: 404 });
    const events = await prisma.cargoEvent.findMany({ where: { cargoId: cargo.id }, orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ data: { cargo, events } });
  }

  return NextResponse.json({ data: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, insId, provider, premiumUsd, coverageUsd } = body ?? {};
  if (!email || !insId) return NextResponse.json({ error: 'email and insId required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const insurance = await prisma.cargoInsurance.create({
    data: {
      cargoId: insId,
      provider: provider || 'CongoConnect Insurance',
      premiumUsd: premiumUsd ? Number(premiumUsd) : 0,
      coverageUsd: coverageUsd ? Number(coverageUsd) : 0,
      status: 'active',
    },
  });

  return NextResponse.json({ data: insurance }, { status: 201 });
}
