import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/airport/[section]?airportId=apt_fih
// Sections: pois, dining, menus, shops, carrentals, localtransport, currency, wifi, emergency, lounges, terminals, gates
const SECTIONS: Record<string, () => Promise<unknown>> = {
  pois: async () => prisma.airportPOI.findMany({ orderBy: { category: 'asc' } }),
  dining: async () => prisma.airportDining.findMany({ orderBy: { name: 'asc' } }),
  menus: async () => {
    const dining = await prisma.airportDining.findMany();
    const items = await prisma.airportMenuItem.findMany();
    return dining.map((d: any) => ({ ...d, menu: items.filter((i: any) => i.diningId === d.id) }));
  },
  shops: async () => prisma.airportShop.findMany({ orderBy: { category: 'asc' } }),
  carrentals: async () => prisma.airportCarRental.findMany({ orderBy: { dailyRateUsd: 'asc' } }),
  localtransport: async () => prisma.airportLocalTransport.findMany({ orderBy: { priceFromUsd: 'asc' } }),
  currency: async () => prisma.airportCurrency.findMany({ orderBy: { type: 'asc' } }),
  wifi: async () => prisma.airportWifi.findMany(),
  emergency: async () => prisma.airportEmergency.findMany({ orderBy: { category: 'asc' } }),
  lounges: async () => prisma.airportLounge.findMany(),
  terminals: async () => {
    const terms = await prisma.airportTerminal.findMany();
    const gates = await prisma.airportGate.findMany();
    return terms.map((t: any) => ({ ...t, gates: gates.filter((g: any) => g.terminalId === t.id) }));
  },
  gates: async () => prisma.airportGate.findMany(),
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const airportId = req.nextUrl.searchParams.get('airportId') || 'apt_fih';

  // Scope data to airport where the model supports it
  const scoped: Record<string, () => Promise<unknown>> = {
    pois: async () => prisma.airportPOI.findMany({ where: { airportId }, orderBy: { category: 'asc' } }),
    dining: async () => prisma.airportDining.findMany({ where: { airportId }, orderBy: { name: 'asc' } }),
    menus: async () => {
      const dining = await prisma.airportDining.findMany({ where: { airportId } });
      const items = await prisma.airportMenuItem.findMany();
      return dining.map((d: any) => ({ ...d, menu: items.filter((i: any) => i.diningId === d.id) }));
    },
    shops: async () => prisma.airportShop.findMany({ where: { airportId }, orderBy: { category: 'asc' } }),
    carrentals: async () => prisma.airportCarRental.findMany({ where: { airportId }, orderBy: { dailyRateUsd: 'asc' } }),
    localtransport: async () => prisma.airportLocalTransport.findMany({ where: { airportId }, orderBy: { priceFromUsd: 'asc' } }),
    currency: async () => prisma.airportCurrency.findMany({ where: { airportId }, orderBy: { type: 'asc' } }),
    wifi: async () => prisma.airportWifi.findMany({ where: { airportId } }),
    emergency: async () => prisma.airportEmergency.findMany({ where: { airportId }, orderBy: { category: 'asc' } }),
    lounges: async () => prisma.airportLounge.findMany({ where: { airportId } }),
    terminals: async () => {
      const terms = await prisma.airportTerminal.findMany({ where: { airportId } });
      const gates = await prisma.airportGate.findMany();
      return terms.map((t: any) => ({ ...t, gates: gates.filter((g: any) => g.terminalId === t.id) }));
    },
    gates: async () => {
      const terms = await prisma.airportTerminal.findMany({ where: { airportId } });
      const ids = terms.map((t: any) => t.id);
      return prisma.airportGate.findMany({ where: { terminalId: { in: ids } } });
    },
  };

  const loader = scoped[section] || SECTIONS[section];
  if (!loader) {
    return NextResponse.json({ error: `Unknown section: ${section}`, sections: Object.keys(SECTIONS) }, { status: 404 });
  }
  const data = await loader();
  return NextResponse.json({ data });
}
