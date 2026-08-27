import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { boardingPassQrString, BoardingPassData } from "@/lib/qr";

export async function GET(req: NextRequest) {
  const trackingNo = req.nextUrl.searchParams.get("trackingNo");
  const ticketNo = req.nextUrl.searchParams.get("ticketNo");

  if (trackingNo) {
    const cargo = await prisma.cargo.findUnique({ where: { trackingNo } });
    if (!cargo) return NextResponse.json({ data: null }, { status: 404 });
    const events = await prisma.cargoEvent.findMany({ where: { cargoId: cargo.id }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ data: { cargo, events } });
  }

  if (ticketNo) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticketNo },
      include: { checkIn: true, boardingPass: true },
    });
    if (!ticket) return NextResponse.json({ data: null }, { status: 404 });
    return NextResponse.json({ data: { ticket, checkIn: ticket.checkIn || null, boardingPass: ticket.boardingPass || null } });
  }

  return NextResponse.json({ data: null }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const { ticketNo, seat, baggageCount, specialRequests } = body ?? {};
  if (!ticketNo) return NextResponse.json({ error: "ticketNo required" }, { status: 400 });

  const ticket = await prisma.ticket.findUnique({
    where: { ticketNo },
    include: { booking: true },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  // Authorization: the ticket's booking must belong to the logged-in user.
  if (ticket.booking?.userId && ticket.booking.userId !== session.userId) {
    return NextResponse.json({ error: "Not authorized for this ticket" }, { status: 403 });
  }

  const existing = await prisma.checkIn.findUnique({ where: { ticketId: ticket.id } });
  if (existing) {
    const bp = await prisma.boardingPass.findUnique({ where: { ticketId: ticket.id } });
    return NextResponse.json({ error: "Already checked in", data: { checkIn: existing, boardingPass: bp }, code: "already_checked_in" }, { status: 409 });
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      ticketId: ticket.id,
      passengerName: ticket.passengerName,
      seat: seat || ticket.seat || undefined,
      cabinClass: ticket.cabinClass,
      baggageCount: Number(baggageCount) || 0,
      specialRequests: specialRequests || undefined,
    },
  });

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { checkInAt: checkIn.checkInAt, checkInStatus: "checked_in" },
  });

  // Issue a signed boarding pass (QR).
  const data: BoardingPassData = {
    ticketNo: ticket.ticketNo,
    passenger: ticket.passengerName,
    flightNo: ticket.flightNo,
    seat: checkIn.seat || ticket.seat || null,
    cabin: ticket.cabinClass,
    from: ticket.originCode,
    to: ticket.destinationCode,
    depart: ticket.departDate.toISOString(),
  };
  const qr = boardingPassQrString(data);
  const boardingPass = await prisma.boardingPass.create({
    data: {
      ticketId: ticket.id,
      checkInId: checkIn.id,
      passengerName: ticket.passengerName,
      flightNo: ticket.flightNo,
      seat: checkIn.seat || ticket.seat || null,
      cabinClass: ticket.cabinClass,
      originCode: ticket.originCode,
      destinationCode: ticket.destinationCode,
      departDate: ticket.departDate,
      qrPayload: qr.split(".")[0],
      signature: qr.split(".")[1],
    },
  });

  return NextResponse.json(
    {
      data: {
        checkIn,
        boardingPass: {
          ...boardingPass,
          qrString: qr,
        },
      },
    },
    { status: 201 }
  );
}
