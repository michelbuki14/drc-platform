import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  if (id) {
    const account = await prisma.corporateAccount.findUnique({
      where: { id },
      include: {
        members: true,
        policies: true,
        bookings: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!account) return NextResponse.json({ data: null }, { status: 404 });
    return NextResponse.json({ data: account });
  }

  const [accounts, total] = await Promise.all([
    prisma.corporateAccount.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: { members: true, _count: { select: { bookings: true } } },
    }),
    prisma.corporateAccount.count(),
  ]);

  return NextResponse.json({ data: accounts, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { companyName, contactEmail, contactName, phone, category, creditLimitUsd, address } = body;

  if (!companyName || !contactEmail || !contactName) {
    return NextResponse.json({ error: 'companyName, contactEmail, contactName required' }, { status: 400 });
  }

  const account = await prisma.corporateAccount.create({
    data: {
      companyName,
      contactEmail: contactEmail.toLowerCase(),
      contactName,
      phone: phone || null,
      category: category || 'enterprise',
      creditLimitUsd: creditLimitUsd ? Number(creditLimitUsd) : 50000,
      address: address || null,
      status: 'pending',
    },
  });

  return NextResponse.json({ data: account }, { status: 201 });
}
