import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const trackingNo = req.nextUrl.searchParams.get('trackingNo');
  if (!trackingNo) return NextResponse.json({ data: [] }, { status: 400 });

  const cargo = await prisma.cargo.findUnique({ where: { trackingNo } });
  if (!cargo) return NextResponse.json({ data: null }, { status: 404 });

  const declarations = await prisma.customsDeclaration.findMany({
    where: { cargoId: cargo.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ data: declarations });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { trackingNo, hsCode, description, valueUsd, weightKg } = body ?? {};
  if (!trackingNo || !hsCode || !description || !valueUsd || !weightKg) {
    return NextResponse.json({ error: 'trackingNo, hsCode, description, valueUsd, weightKg required' }, { status: 400 });
  }

  const cargo = await prisma.cargo.findUnique({ where: { trackingNo } });
  if (!cargo) return NextResponse.json({ error: 'Cargo not found' }, { status: 404 });

  const declaration = await prisma.customsDeclaration.create({
    data: {
      cargoId: cargo.id,
      hsCode,
      description,
      valueUsd: Number(valueUsd),
      weightKg: Number(weightKg),
      status: 'pending',
    },
  });

  return NextResponse.json({ data: declaration }, { status: 201 });
}
