import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

const VALID_STATUS = ["scheduled", "boarding", "departed", "enroute", "arrived", "delayed", "cancelled", "diverted"];

// Movement log: advance a flight's operational status
export async function POST(req: NextRequest) {
  const s = requireRole(req, ['admin', 'ops', 'airport_ops']);
  if (s instanceof NextResponse) return s;

  const body = await req.json().catch(() => null);
  if (!body?.instanceId || !body?.status) {
    return NextResponse.json({ error: "instanceId and status are required" }, { status: 400 });
  }
  if (!VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ error: `status must be one of ${VALID_STATUS.join(", ")}` }, { status: 400 });
  }

  const inst = await prisma.flightInstance.findUnique({ where: { id: body.instanceId } });
  if (!inst) return NextResponse.json({ error: "Flight not found" }, { status: 404 });

  const now = new Date();
  const updated = await prisma.flightInstance.update({
    where: { id: inst.id },
    data: {
      status: body.status,
      ...(body.gate ? { gate: body.gate } : {}),
      ...(body.delayMin !== undefined ? { delayMin: Number(body.delayMin) } : {}),
      // Auto timestamps
      ...(body.status === "departed" && !inst.actDepart ? { actDepart: now } : {}),
      ...(body.status === "arrived" ? { actArrive: now } : {}),
    },
    include: { aircraft: true },
  });

  return NextResponse.json({ data: updated });
}
