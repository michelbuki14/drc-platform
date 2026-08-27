import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Crew list with duty status
export async function GET(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;
  const crew = await prisma.crew.findMany({
    include: { assignments: { where: { schedDepart: { gte: new Date() } }, orderBy: { schedDepart: "asc" } } },
    orderBy: { employeeNo: "asc" },
  });
  return NextResponse.json({
    count: crew.length,
    data: crew.map((c: any) => ({
      id: c.id,
      employeeNo: c.employeeNo,
      name: `${c.firstName} ${c.lastName}`,
      role: c.role,
      baseAirport: c.baseAirport,
      dutyHoursThisWeek: c.dutyHoursThisWeek,
      maxDutyHours: c.maxDutyHours,
      dutyPct: Math.round((c.dutyHoursThisWeek / c.maxDutyHours) * 100),
      licenseExpiry: c.licenseExpiry,
      upcomingFlights: c.assignments.map((a: any) => ({ flightNo: a.flightNo, schedDepart: a.schedDepart })),
    })),
  });
}

// Assign / unassign crew to a flight instance
export async function PUT(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const body = await req.json().catch(() => null);
  if (!body?.instanceId || !body?.crewId || !body?.action) {
    return NextResponse.json({ error: "instanceId, crewId and action are required" }, { status: 400 });
  }

  const [inst, member] = await Promise.all([
    prisma.flightInstance.findUnique({ where: { id: body.instanceId }, include: { crew: true } }),
    prisma.crew.findUnique({ where: { id: body.crewId }, include: { assignments: true } }),
  ]);
  if (!inst || !member) return NextResponse.json({ error: "Flight or crew not found" }, { status: 404 });

  if (body.action === "assign") {
    // Duty-time guard: block assignment if it would exceed weekly limit
    const flightHours = Math.max(1, Math.round((inst.schedArrive.getTime() - inst.schedDepart.getTime()) / 3600000));
    if (member.dutyHoursThisWeek + flightHours > member.maxDutyHours) {
      return NextResponse.json(
        { error: `Duty limit exceeded: ${member.firstName} ${member.lastName} at ${member.dutyHoursThisWeek}h/${member.maxDutyHours}h (+${flightHours}h)` },
        { status: 409 }
      );
    }
    await prisma.flightInstance.update({
      where: { id: inst.id },
      data: { crew: { connect: { id: member.id } } },
    });
    await prisma.crew.update({
      where: { id: member.id },
      data: { dutyHoursThisWeek: member.dutyHoursThisWeek + flightHours },
    });
    return NextResponse.json({ ok: true, dutyHoursThisWeek: member.dutyHoursThisWeek + flightHours });
  }

  if (body.action === "unassign") {
    await prisma.flightInstance.update({
      where: { id: inst.id },
      data: { crew: { disconnect: { id: member.id } } },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
