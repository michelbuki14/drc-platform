import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');

  if (id) {
    const service = await prisma.facilitationService.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: service });
  }
  const services = await prisma.facilitationService.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ data: services, count: services.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const { name, description, priceUsd, isAvailable, category, provider } = body;

  if (!name || !category) {
    return NextResponse.json({ error: 'name and category required' }, { status: 400 });
  }

  const service = await prisma.facilitationService.create({
    data: {
      name,
      description: description || '',
      isAvailable: isAvailable !== false,
      priceUsd: priceUsd ? Number(priceUsd) : 0,
      category,
      provider: provider || null,
    },
  });

  return NextResponse.json({ data: service }, { status: 201 });
}
