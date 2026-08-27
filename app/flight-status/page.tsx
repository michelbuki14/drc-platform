'use client';

import { useState, useEffect } from 'react';

interface FlightStatusData {
  id: string;
  flightNo: string;
  status: string;
  gate: string;
  terminal: string;
  baggageClaim: string;
  estimatedArrival: string;
  actualArrival: string;
  delayMin: number;
  updatedAt: string;
  flight: {
    flightNo: string;
    airline: string;
    departTime: string;
    arriveTime: string;
    priceUsd: number;
    origin: { name: string; code: string };
    destination: { name: string; code: string };
    airlineRef: { name: string; code: string };
  };
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  landed: { bg: 'bg-[#E8F3EC]', text: 'text-[#1B4D2E]', label: 'Landed' },
  boarding: { bg: 'bg-[#E0E7FF]', text: 'text-[#0B2545]', label: 'Boarding' },
  departed: { bg: 'bg-[#F5E7C7]', text: 'text-[#8E6D14]', label: 'Departed' },
  enroute: { bg: 'bg-[#E8F3EC]', text: 'text-[#1B4D2E]', label: 'In Air' },
  delayed: { bg: 'bg-[#FEF3C7]', text: 'text-[#9A5B3C]', label: 'Delayed' },
  cancelled: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', label: 'Cancelled' },
  default: { bg: 'bg-[#F1EDE7]', text: 'text-[#7D7A74]', label: 'Unknown' },
};

export default function FlightStatusPage() {
  const [statuses, setStatuses] = useState<FlightStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<FlightStatusData | null>(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const res = await fetch('/api/flight-status');
      const data = await res.json();
      setStatuses(data.data || []);
    } catch (e) {
      console.error('Failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (flightNo: string) => {
    setSelectedFlight(flightNo);
    try {
      const res = await fetch(`/api/flight-status/${flightNo}?flightNo=${flightNo}`);
      const data = await res.json();
      setLiveStatus(data.data);
    } catch (e) {
      console.error('Failed:', e);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
        </div>
        <p className="text-sm text-[#7D7A74]">Loading flight status…</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B2545] text-white text-xs font-bold">✈</div>
                <h1 className="font-display text-2xl font-bold text-[#0B2545]">Flight Status</h1>
              </div>
              <p className="text-sm text-[#7D7A74]">Real-time flight tracking</p>
              <div className="mt-2 mx-auto h-1 w-24 rounded-full bg-[#D4AF37]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7D7A74]">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Selected flight detail */}
        {liveStatus && (
          <section className="mb-8">
            <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-[#0B2545]">
                      {liveStatus.flight.airline} {liveStatus.flightNo}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[liveStatus.status]?.bg} ${STATUS_STYLES[liveStatus.status]?.text}`}>
                      {STATUS_STYLES[liveStatus.status]?.label || liveStatus.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#7D7A74]">
                    {liveStatus.flight.origin.name} ({liveStatus.flight.origin.code}) → {liveStatus.flight.destination.name} ({liveStatus.flight.destination.code})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedFlight(null); setLiveStatus(null); }}
                  className="text-xs text-[#7D7A74] hover:text-[#0B2545] underline"
                >
                  Clear selection
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-[#FAF8F3] p-3">
                  <p className="text-xs text-[#7D7A74]">From</p>
                  <p className="font-semibold text-[#0B2545]">{liveStatus.flight.origin.name} ({liveStatus.flight.origin.code})</p>
                </div>
                <div className="rounded-lg bg-[#FAF8F3] p-3">
                  <p className="text-xs text-[#7D7A74]">To</p>
                  <p className="font-semibold text-[#0B2545]">{liveStatus.flight.destination.name} ({liveStatus.flight.destination.code})</p>
                </div>
                <div className="rounded-lg bg-[#FAF8F3] p-3">
                  <p className="text-xs text-[#7D7A74]">Scheduled Depart</p>
                  <p className="font-semibold text-[#0B2545]">{liveStatus.flight.departTime}</p>
                </div>
                <div className="rounded-lg bg-[#FAF8F3] p-3">
                  <p className="text-xs text-[#7D7A74]">Scheduled Arrival</p>
                  <p className="font-semibold text-[#0B2545]">{liveStatus.flight.arriveTime}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {liveStatus.gate && (
                  <div className="rounded-lg bg-[#FAF8F3] p-3">
                    <p className="text-xs text-[#7D7A74]">Gate</p>
                    <p className="font-semibold text-[#0B2545]">{liveStatus.gate}</p>
                  </div>
                )}
                {liveStatus.terminal && (
                  <div className="rounded-lg bg-[#FAF8F3] p-3">
                    <p className="text-xs text-[#7D7A74]">Terminal</p>
                    <p className="font-semibold text-[#0B2545]">{liveStatus.terminal}</p>
                  </div>
                )}
                {liveStatus.baggageClaim && (
                  <div className="rounded-lg bg-[#FAF8F3] p-3">
                    <p className="text-xs text-[#7D7A74]">Baggage Claim</p>
                    <p className="font-semibold text-[#0B2545]">{liveStatus.baggageClaim}</p>
                  </div>
                )}
                {liveStatus.delayMin > 0 && (
                  <div className="rounded-lg bg-[#FEF3C7] p-3">
                    <p className="text-xs text-[#7D7A74]">Delay</p>
                    <p className="font-semibold text-[#9A5B3C]">+{liveStatus.delayMin} min</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#E2DFD9] text-xs text-[#7D7A74]">
                Last updated: {new Date(liveStatus.updatedAt).toLocaleString()}
              </div>
            </div>
          </section>
        )}

        {/* All flights table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-[#0B2545]">All Flights</h2>
            <button
              type="button"
              onClick={fetchStatuses}
              className="text-xs text-[#0B2545] hover:underline font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="border-b border-[#E2DFD9] bg-white z-10">
                  <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">Flight</th>
                  <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">Airline</th>
                  <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">Route</th>
                  <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">Status</th>
                  <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">Gate</th>
                  <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.15em] text-[#7D7A74]">Terminal</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((status) => {
                  const statusStyle = STATUS_STYLES[status.status] || STATUS_STYLES.default;
                  const isSelected = selectedFlight === status.flightNo;
                  return (
                    <tr
                      key={status.id}
                      className={`border-b border-[#E2DFD9] hover:bg-[#FAF8F3] transition-colors cursor-pointer ${isSelected ? 'bg-[#0B2545]/5 border-l-2 border-l-[#0B2545]' : ''}`}
                      onClick={() => handleSelect(status.flightNo)}
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-[#0B2545]">{status.flightNo}</td>
                      <td className="px-4 py-3 text-[#1A1A18]">{status.flight.airline}</td>
                      <td className="px-4 py-3 text-[#1A1A18]">
                        {status.flight.origin.name} → {status.flight.destination.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#7D7A74]">{status.gate || '-'}</td>
                      <td className="px-4 py-3 text-[#7D7A74]">{status.terminal || '-'}</td>
                    </tr>
                  );
                })}
                {statuses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#7D7A74]">No flight status data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
