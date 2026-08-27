import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

interface FlightPageProps {
  params: Promise<{ id: string }>;
}

async function getFlight(id: string) {
  const flight = await prisma.flight.findUnique({
    where: { id },
    include: {
      origin: { select: { name: true, country: true } },
      destination: { select: { name: true, country: true } },
    },
  });
  if (!flight) return null;
  return flight;
}

export default async function FlightDetailPage({ params }: FlightPageProps) {
  const { id } = await params;
  const flight = await getFlight(id);

  if (!flight) {
    notFound();
  }

  const origin = flight.origin;
  const dest = flight.destination;

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 pb-16">
        {/* Back link */}
        <div className="mb-4">
          <Link href="/flights" className="flex items-center gap-1.5 text-sm text-[#7D7A74] hover:text-[#0B2545] transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            All Flights
          </Link>
        </div>

        {/* Flight card */}
        <div className="rounded-2xl border border-[#E2DFD9] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {/* Header */}
          <div className="border-b border-[#E2DFD9] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white font-bold text-sm shadow-sm">
                  {flight.airline.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-[#0B2545]">
                    {flight.airline} · {flight.flightNo}
                  </h1>
                  <p className="text-xs text-[#7D7A74]">ID: {flight.id}</p>
                </div>
              </div>
              {flight.status === 'cancelled' && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  Cancelled
                </span>
              )}
            </div>
          </div>

          {/* Route visualization */}
          <div className="px-6 py-8">
            <div className="flex flex-col items-center">
              {/* Origin */}
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-[#0B2545]">{origin.name}</div>
                <div className="text-sm text-[#7D7A74]">{origin.country}</div>
              </div>

              {/* Route line */}
              <div className="flex-1 mx-6 my-4 relative">
                <div className="absolute left-0 top-1/2 h-0.5 w-1/2 bg-[#6183B8]" />
                <div className="absolute right-0 top-1/2 h-0.5 w-1/2 bg-[#D4AF37]" />
                <div className="relative z-10 flex items-center justify-center">
                  <svg className="h-12 w-12" viewBox="0 0 200 48" fill="none">
                    <path d="M4 24 Q50 8 96 24 Q142 40 196 24" stroke="#7D7A74" strokeWidth="1.5" fill="none" />
                    <path d="M96 24 L96 8 L104 16 L96 24 Z" fill="#0B2545" />
                    <circle cx="96" cy="24" r="4" fill="#0B2545" />
                  </svg>
                </div>
              </div>

              {/* Destination */}
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-[#D4AF37]">{dest.name}</div>
                <div className="text-sm text-[#7D7A74]">{dest.country}</div>
              </div>
            </div>

            {/* Flight details grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E2DFD9] bg-[#FAF8F3] p-4 text-center">
                <p className="text-xs text-[#7D7A74] uppercase tracking-[0.12em]">Departure</p>
                <p className="mt-1 font-display text-xl font-bold text-[#0B2545]">{flight.departTime}</p>
              </div>
              <div className="rounded-xl border border-[#E2DFD9] bg-[#FAF8F3] p-4 text-center">
                <p className="text-xs text-[#7D7A74] uppercase tracking-[0.12em]">Arrival</p>
                <p className="mt-1 font-display text-xl font-bold text-[#D4AF37]">{flight.arriveTime}</p>
              </div>
              <div className="rounded-xl border border-[#E2DFD9] bg-[#FAF8F3] p-4 text-center">
                <p className="text-xs text-[#7D7A74] uppercase tracking-[0.12em]">Duration</p>
                <p className="mt-1 font-display text-xl font-bold text-[#0B2545]">{flight.durationMin} min</p>
              </div>
            </div>

            {/* Price + Book */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#E2DFD9] bg-[#FAF8F3] px-6 py-4">
              <div>
                <p className="text-xs text-[#7D7A74] uppercase tracking-wider">Price</p>
                <p className="mt-1 font-display text-3xl font-bold text-[#D4AF37]">${flight.priceUsd.toFixed(0)}</p>
              </div>
              <Link
                href={`/flights?from=${encodeURIComponent(origin.name)}&to=${encodeURIComponent(dest.name)}&date=${flight.departTime}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20"
              >
                Search similar flights
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {flight.status === 'cancelled' && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
                <p className="font-display font-semibold text-red-700">This flight has been cancelled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
