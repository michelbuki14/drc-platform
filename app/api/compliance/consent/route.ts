import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const consents = await prisma.clinicalData.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: 'desc' },
  });

  return NextResponse.json({
    data: {
      userId: user.id,
      consents,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, dataType, dataValue, consent, dataPurpose } = body ?? {};

  if (!email || !dataType) {
    return NextResponse.json({ error: 'email and dataType required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const record = await prisma.clinicalData.create({
    data: {
      userId: user.id,
      dataType,
      dataValue: dataValue ?? '',
      consent: consent ?? false,
      dataPurpose: dataPurpose ?? 'flight_assistance',
    },
  });

  return NextResponse.json({ data: record });
}
