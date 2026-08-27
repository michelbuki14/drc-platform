import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Fleet status board
export async function GET(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;
  const [aircraft, maint] = await Promise.all([
    prisma.aircraft.findMany({
      include: {
        instances: {
          where: { schedDepart: { gte: new Date(Date.now() - 86400000) } },
          orderBy: { schedDepart: "asc" },
          take: 3,
        },
        maintLogs: { where: { status: { not: "closed" } } },
      },
      orderBy: { registration: "asc" },
    }),
    prisma.maintenanceLog.findMany({
      where: { status: { not: "closed" } },
      include: { aircraft: true },
    }),
  ]);

  return NextResponse.json({
    count: aircraft.length,
    data: aircraft.map((a: any) => ({
      id: a.id,
      registration: a.registration,
      type: a.type,
      name: a.name,
      status: a.status,
      seatsTotal: a.seatsY + a.seatsC,
      rangeKm: a.rangeKm,
      engineHours: a.engineHours,
      homeBase: a.homeBase,
      nextMaintDueAt: a.nextMaintDueAt,
      upcomingFlights: a.instances.map((i: any) => ({ flightNo: i.flightNo, schedDepart: i.schedDepart, status: i.status })),
      openMaint: a.maintLogs.map((m: any) => ({ type: m.type, description: m.description, status: m.status })),
    })),
    openMaintenance: maint.length,
  });
}

// Set aircraft status / log maintenance
export async function PUT(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const body = await req.json().catch(() => null);
  if (!body?.aircraftId || !body?.action) {
    return NextResponse.json({ error: "aircraftId and action are required" }, { status: 400 });
  }

  if (body.action === "set_status") {
    const VALID = ["active", "maintenance", "grounded"];
    if (!VALID.includes(body.value)) {
      return NextResponse.json({ error: `value must be one of ${VALID.join(", ")}` }, { status: 400 });
    }
    const updated = await prisma.aircraft.update({ where: { id: body.aircraftId }, data: { status: body.value } });
    return NextResponse.json({ data: updated });
  }

  if (body.action === "log_maintenance") {
    if (!body.type || !body.description) {
      return NextResponse.json({ error: "type and description are required for log_maintenance" }, { status: 400 });
    }
    const log = await prisma.maintenanceLog.create({
      data: { aircraftId: body.aircraftId, type: body.type, description: body.description },
    });
    // Maintenance automatically grounds the airframe
    await prisma.aircraft.update({ where: { id: body.aircraftId }, data: { status: "maintenance" } });
    return NextResponse.json({ data: log }, { status: 201 });
  }

  if (body.action === "close_maintenance") {
    await prisma.maintenanceLog.updateMany({
      where: { aircraftId: body.aircraftId, status: { not: "closed" } },
      data: { status: "closed", closedAt: new Date() },
    });
    const updated = await prisma.aircraft.update({ where: { id: body.aircraftId }, data: { status: "active" } });
    return NextResponse.json({ data: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
