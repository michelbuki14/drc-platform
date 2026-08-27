import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const trackingNo = req.nextUrl.searchParams.get('trackingNo');
  if (!trackingNo) {
    return NextResponse.json({ error: 'trackingNo required' }, { status: 400 });
  }
  const cargo = await prisma.cargo.findUnique({ where: { trackingNo } });
  if (!cargo) {
    return NextResponse.json({ error: 'Cargo not found' }, { status: 404 });
  }
  
  // Include events (milestones handled as events with type 'milestone')
  const events = await prisma.cargoEvent.findMany({ where: { cargoId: cargo.id }, orderBy: { createdAt: 'desc' } });
  const milestones = events.filter(e => e.status === 'milestone').sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  return NextResponse.json({ cargo, events, milestones });
}
