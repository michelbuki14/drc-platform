import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { randomBytes } from "crypto";

function ticketNo(): string {
  return "TK-" + randomBytes(5).toString("hex").toUpperCase();
}

// POST /api/bookings - Create a booking with passenger details + issue tickets (auth required)
export async function POST(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { flightId, passengers, contactEmail, contactPhone, totalUsd } = body;

  if (!flightId || !passengers?.length) {
    return NextResponse.json({ error: "flightId, passengers required" }, { status: 400 });
  }

  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
    include: { origin: true, destination: true },
  });
  if (!flight) return NextResponse.json({ error: "Flight not found" }, { status: 404 });

  const reference = "BK-" + Date.now() + "-" + randomBytes(3).toString("hex").toUpperCase();

  const booking = await prisma.booking.create({
    data: {
      reference,
      userId: session.userId,
      flightId,
      passengerName: passengers?.[0]?.name || "Passenger",
      email: passengers?.[0]?.email || contactEmail || "",
      phone: passengers?.[0]?.phone || contactPhone,
      seats: passengers?.length || 1,
      totalUsd,
      status: "confirmed",
    },
  });

  // Issue one ticket per passenger (needed for check-in + boarding pass).
  const tickets = await Promise.all(
    passengers.map((p: any) =>
      prisma.ticket.create({
        data: {
          bookingId: booking.id,
          ticketNo: ticketNo(),
          passengerName: p.name || "Passenger",
          seat: p.seat || null,
          cabinClass: p.cabinClass || "Y",
          flightNo: flight.flightNo,
          originCode: flight.origin?.name || flight.originId,
          destinationCode: flight.destination?.name || flight.destinationId,
          departDate: new Date(),
          status: "issued",
        },
      })
    )
  );

  return NextResponse.json(
    { data: { ...booking, tickets, flight }, reference: booking.reference },
    { status: 201 }
  );
}

// GET /api/bookings - Get the authenticated user's bookings
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const bookings = await prisma.booking.findMany({
    where: { userId: session.userId },
    include: { flight: true, tickets: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: bookings, total: bookings.length });
}
