import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Flight detail for ops: full passenger manifest
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;
  const { id } = await params;
  const inst = await prisma.flightInstance.findUnique({
    where: { id },
    include: {
      aircraft: true,
      crew: true,
      passengers: { orderBy: [{ cabinClass: "asc" }, { seat: "asc" }] },
    },
  });
  if (!inst) return NextResponse.json({ error: "Flight not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      ...inst,
      stats: {
        total: inst.passengers.length,
        boarded: inst.passengers.filter((p: any) => p.checkInStatus === "boarded").length,
        checkedIn: inst.passengers.filter((p: any) => p.checkInStatus === "checked_in").length,
        noShow: inst.passengers.filter((p: any) => p.checkInStatus === "no_show").length,
        bags: inst.passengers.reduce((s, p) => s + p.bagCount, 0),
      },
    },
  });
}

// Check in / board / no-show a passenger
export async function PUT(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const body = await req.json().catch(() => null);
  if (!body?.passengerId || !body?.checkInStatus) {
    return NextResponse.json({ error: "passengerId and checkInStatus are required" }, { status: 400 });
  }
  const VALID = ["none", "checked_in", "boarded", "no_show"];
  if (!VALID.includes(body.checkInStatus)) {
    return NextResponse.json({ error: `checkInStatus must be one of ${VALID.join(", ")}` }, { status: 400 });
  }

  const updated = await prisma.passenger.update({
    where: { id: body.passengerId },
    data: {
      checkInStatus: body.checkInStatus,
      ...(body.seat ? { seat: body.seat } : {}),
      ...(body.bagCount !== undefined ? { bagCount: Number(body.bagCount) } : {}),
    },
  });
  return NextResponse.json({ data: updated });
}
