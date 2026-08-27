import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }
  
  const service = await prisma.facilitationService.findUnique({
    where: { id },
  });
  
  if (!service) {
    return NextResponse.json({ error: 'Facilitation service not found' }, { status: 404 });
  }
  
  return NextResponse.json({ service });
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
      priceUsd: priceUsd ? Number(priceUsd) : 0,
      isAvailable: isAvailable !== false,
      category,
      provider: provider || null,
    },
  });
  
  return NextResponse.json({ service }, { status: 201 });
}
