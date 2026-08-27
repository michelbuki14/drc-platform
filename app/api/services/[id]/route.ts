import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  return NextResponse.json({ service });
}

export async function POST(req: NextRequest) {
  // Create a new service
  const body = await req.json().catch(() => ({}));
  const { name, description, category, priceFromUsd, icon } = body;

  if (!name || !category) {
    return NextResponse.json({ error: 'name and category required' }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36),
      name,
      description: description || '',
      category,
      priceFromUsd: priceFromUsd ? Number(priceFromUsd) : null,
      icon: icon || null,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}
