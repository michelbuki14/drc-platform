'use client';

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/components/AuthProvider';

export default function BookingPage() {
  const params = useParams();
  const flightNo = params.flightNo as string;
  const { user } = useAuth();
  const [flight, setFlight] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'seat' | 'details' | 'ticket'>('seat');

  useEffect(() => {
    if (flightNo) {
      fetch(`/api/flights/${flightNo}`).then(r => r.json()).then(d => setFlight(d.data));
    }
  }, [flightNo]);

  useEffect(() => {
    // Prefill from logged-in user
    if (user && !passengerName) {
      setPassengerName(user.name || '');
      setPassengerEmail(user.email || '');
    }
  }, [user, passengerName]);

  const rows = Array.from({ length: 20 }, (_, i) => i + 1);
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];

  const confirmBooking = async () => {
    setError('');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flightId: flight?.id,
        passengers: [{ name: passengerName, email: passengerEmail, seat: selectedSeat }],
        totalUsd: flight?.priceUsd,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setBooking(data.data);
      setStep('ticket');
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Booking failed. Please log in and try again.');
    }
  };

  if (!flight) return <div className="flex items-center justify-center min-h-[60vh]"><p>Loading...</p></div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">Book Flight {flightNo}</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{flight.origin?.name} → {flight.destination?.name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {error && <p className="mb-4 rounded-lg bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">{error}</p>}

        {step === 'seat' && (
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Select Your Seat</h2>
            <div className="card card-elevated p-6 overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 min-w-[300px]">
                <div />
                {cols.map(c => <div key={c} className="text-center text-xs font-bold text-[var(--color-text-muted)]">{c}</div>)}
                {rows.map(row => (
                  <Fragment key={row}>
                    <div key={`row${row}`} className="text-xs font-bold text-[var(--color-text-muted)] flex items-center">{row}</div>
                    {cols.map(col => {
                      const seat = `${row}${col}`;
                      const isSelected = selectedSeat === seat;
                      return (
                        <button
                          key={seat}
                          onClick={() => setSelectedSeat(seat)}
                          className={`h-8 rounded text-xs font-bold transition ${isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--cc-charcoal-100)] hover:bg-[var(--color-primary)]/20'}`}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
            {selectedSeat && (
              <button onClick={() => setStep('details')} className="btn-primary mt-4 px-6 py-2 font-semibold rounded-lg">
                Continue with Seat {selectedSeat}
              </button>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="max-w-md mx-auto">
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Passenger Details</h2>
            <div className="card card-elevated p-6 space-y-4">
              <input className="input w-full" placeholder="Full Name" value={passengerName} onChange={e => setPassengerName(e.target.value)} />
              <input className="input w-full" placeholder="Email" value={passengerEmail} onChange={e => setPassengerEmail(e.target.value)} />
              <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                <span>Seat: {selectedSeat}</span>
                <span>Price: ${flight.priceUsd}</span>
              </div>
              <button onClick={confirmBooking} className="btn-primary w-full py-2 font-semibold rounded-lg">
                {user ? 'Confirm Booking' : 'Log in to book'}
              </button>
            </div>
          </div>
        )}

        {step === 'ticket' && booking && (
          <div className="max-w-md mx-auto text-center">
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)] mb-4">Booking Confirmed!</h2>
            <div className="card card-elevated p-6">
              <p className="text-sm text-[var(--color-text-muted)]">Reference</p>
              <p className="font-mono font-bold text-[var(--color-primary)]">{booking.reference}</p>

              {(booking.tickets || []).map((tk: any) => (
                <div key={tk.id} className="mt-4 rounded-xl border border-[var(--color-border-subtle)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">Ticket {tk.ticketNo}</p>
                  <div className="flex justify-center bg-white p-3 rounded-lg mt-2">
                    <QRCodeSVG
                      value={JSON.stringify({
                        t: tk.ticketNo,
                        f: flight.flightNo,
                        s: tk.seat || selectedSeat,
                        p: tk.passengerName,
                      })}
                      size={150}
                      level="M"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">Scan at check-in to retrieve your boarding pass</p>
                </div>
              ))}

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-[var(--color-text-muted)]">Flight</p><p className="font-semibold">{flight.flightNo}</p></div>
                <div><p className="text-[var(--color-text-muted)]">Seat</p><p className="font-semibold">{selectedSeat}</p></div>
                <div><p className="text-[var(--color-text-muted)]">Passenger</p><p className="font-semibold">{passengerName}</p></div>
                <div><p className="text-[var(--color-text-muted)]">Total</p><p className="font-semibold">${booking.totalUsd}</p></div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-semibold">✓ Ready for online check-in 24h before departure</p>
                <a href={`/checkin?ticketNo=${booking.tickets?.[0]?.ticketNo || ''}`} className="btn-primary mt-2 inline-block px-4 py-2 text-sm rounded-lg">Go to Check-in</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
