import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Departures board: today's flight instances with destination codes
export async function GET(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 2); // today + tomorrow

  const flights = await prisma.flightInstance.findMany({
    where: { schedDepart: { gte: start, lt: end } },
    include: { aircraft: true },
    orderBy: { schedDepart: "asc" },
  });

  // Map flight numbers to route codes via the schedule table
  const sched = await prisma.flight.findMany({
    select: { flightNo: true, origin: { select: { name: true } }, destination: { select: { name: true } } },
  });
  const routeByFlightNo = new Map(sched.map((s: any) => [s.flightNo, { from: s.origin.name, to: s.destination.name }]));

  return NextResponse.json({
    count: flights.length,
    data: flights.map((f: any) => {
      const route = routeByFlightNo.get(f.flightNo);
      return {
        id: f.id,
        flightNo: f.flightNo,
        airline: f.airline,
        originCode: code(route?.from),
        destinationCode: code(route?.to) ?? "—",
        schedDepart: f.schedDepart,
        schedArrive: f.schedArrive,
        gate: f.gate,
        status: f.status,
        delayMin: f.delayMin,
        aircraft: f.aircraft ? { registration: f.aircraft.registration, type: f.aircraft.type } : null,
      };
    }),
  });
}

const CODES: Record<string, string> = {
  Kinshasa: "FIH", Lubumbashi: "FBM", Goma: "GOM", Kisangani: "FKI",
  Brussels: "BRU", Paris: "CDG", London: "LHR", Johannesburg: "JNB",
  Dubai: "DXB", Istanbul: "IST", Nairobi: "NBO", "Addis Ababa": "ADD",
};

function code(city?: string) {
  return city ? (CODES[city] ?? city.slice(0, 3).toUpperCase()) : undefined;
}
