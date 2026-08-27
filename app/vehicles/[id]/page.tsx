'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  transmission: string;
  fuel: string;
  luggageSlots: number;
  seats: number;
  dailyRateUsd: number;
  image: string | null;
  location: string;
  licensePlate: string | null;
}

interface BookingForm {
  email: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverName: string;
  driverLicenseNo: string;
  guests: string;
}

function BookVehicleModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const [form, setForm] = useState<BookingForm>({
    email: 'dcuser@congoconnect.cd',
    pickupDate: '',
    pickupTime: '',
    dropoffDate: '',
    dropoffTime: '',
    driverName: '',
    driverLicenseNo: '',
    guests: '1',
  });
  const [bookingState, setBookingState] = useState(false);
  const [result, setResult] = useState<any>(null);

  const days = form.dropoffDate && form.pickupDate
    ? Math.max(1, Math.ceil((new Date(form.dropoffDate).getTime() - new Date(form.pickupDate).getTime()) / 86400000))
    : 1;

  const total = vehicle.dailyRateUsd * days * parseInt(form.guests || '1');

  const submit = async () => {
    if (!vehicle || !form.pickupDate || !form.driverName || !form.driverLicenseNo) return;
    setBookingState(true);
    try {
      const res = await fetch('/api/vehicles/[id]', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          userId: 'usr_test001',
          pickupCity: vehicle.location,
          pickupDate: form.pickupDate,
          pickupTime: form.pickupTime || null,
          dropoffCity: vehicle.location,
          dropoffDate: form.dropoffDate || null,
          dropoffTime: form.dropoffTime || null,
          driverName: form.driverName,
          driverLicenseNo: form.driverLicenseNo,
          guests: parseInt(form.guests || '1'),
          totalUsd: total,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setResult({ ref: data.data.reference, status: data.data.status });
      }
    } catch { /* ignore */ } finally {
      setBookingState(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF8F3]/60 backdrop-blur-sm">
      <div className="rounded-2xl border border-[#E2DFD9] bg-white p-6 shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-[#0B2545]">
            Rent {vehicle.brand} {vehicle.model}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-[#7D7A74] hover:text-[#0B2545] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-[#7D7A74] mb-4">
          ${vehicle.dailyRateUsd}/day · {vehicle.transmission} · {vehicle.fuel} · {vehicle.seats} seats
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={form.driverName}
            onChange={(e) => setForm({ ...form, driverName: e.target.value })}
            placeholder="Driver full name"
            className="w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
          />
          <input
            type="text"
            value={form.driverLicenseNo}
            onChange={(e) => setForm({ ...form, driverLicenseNo: e.target.value })}
            placeholder="Driver license number"
            className="w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#7D7A74]">Pickup Date</label>
              <input
                type="date"
                value={form.pickupDate}
                onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="mt-0.5 w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-[#7D7A74]">Pickup Time</label>
              <input
                type="time"
                value={form.pickupTime}
                onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                className="mt-0.5 w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#7D7A74]">Drop-off Date</label>
              <input
                type="date"
                value={form.dropoffDate}
                onChange={(e) => setForm({ ...form, dropoffDate: e.target.value })}
                min={form.pickupDate || new Date().toISOString().split('T')[0]}
                className="mt-0.5 w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-[#7D7A74]">Drop-off Time</label>
              <input
                type="time"
                value={form.dropoffTime}
                onChange={(e) => setForm({ ...form, dropoffTime: e.target.value })}
                className="mt-0.5 w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#7D7A74]">Guests</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
                className="mt-0.5 w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              />
            </div>
            <div className="text-right">
              <p className="text-xs text-[#7D7A74]">{days} day{days > 1 ? 's' : ''}</p>
              <p className="font-semibold text-[#0B2545]">${total.toFixed(2)} total</p>
            </div>
          </div>
          {result && (
            <div className="rounded-xl bg-[#E8F3EC] border border-[#9AC09E] p-3 text-center">
              <p className="text-sm font-semibold text-[#1B4D2E]">✅ Booking {result.ref} confirmed</p>
              <p className="text-xs text-[#7D7A74]">{result.status}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm font-medium text-[#7D7A74] hover:bg-[#E2DFD9] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!form.pickupDate || !form.driverName || !form.driverLicenseNo}
              className="flex-1 rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {bookingState ? 'Booking…' : 'Confirm Rental'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VehicleDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/vehicles?id=${id}`)
      .then((r) => r.json())
      .then((data) => setVehicle(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-sm font-bold text-white shadow-sm">
                  C
                </div>
                <span className="text-base font-bold text-[#0B2545]">
                  Congo<span className="text-[#D4AF37]">Connect</span>
                </span>
              </Link>
              <span className="text-sm text-[#7D7A74]">Vehicle Details</span>
            </div>
            <div className="flex gap-2">
              <Link href="/vehicles" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors">
                ← All Vehicles
              </Link>
              <Link href="/" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors ml-2">
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
            </div>
          </div>
        ) : vehicle ? (
          <>
            {/* Hero image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF8F3] mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {vehicle.image ? (
                <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">🚗</span>
                </div>
              )}
            </div>

            {/* Title + price */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#0B2545]">
                  {vehicle.name}
                </h1>
                <p className="mt-1 text-sm text-[#7D7A74]">
                  {vehicle.brand} {vehicle.model} · {vehicle.category}
                </p>
                <p className="mt-1 text-sm text-[#0B2545]">
                  📍 {vehicle.location}
                </p>
                {vehicle.licensePlate && (
                  <p className="mt-0.5 text-xs text-[#7D7A74]">Plate: {vehicle.licensePlate}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold text-[#D4AF37]">
                  ${vehicle.dailyRateUsd}
                </p>
                <p className="text-sm text-[#7D7A74]">/ day</p>
              </div>
            </div>

            {/* Specs + CTA */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm">
                  <h2 className="text-base font-semibold text-[#0B2545] mb-2">Specifications</h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[#7D7A74]">Transmission</p>
                      <p className="font-medium text-[#1A1A18]">{vehicle.transmission}</p>
                    </div>
                    <div>
                      <p className="text-[#7D7A74]">Fuel</p>
                      <p className="font-medium text-[#1A1A18]">{vehicle.fuel}</p>
                    </div>
                    <div>
                      <p className="text-[#7D7A74]">Seats</p>
                      <p className="font-medium text-[#1A1A18]">{vehicle.seats} passengers</p>
                    </div>
                    <div>
                      <p className="text-[#7D7A74]">Luggage</p>
                      <p className="font-medium text-[#1A1A18]">{vehicle.luggageSlots} slots</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm">
                  <h2 className="text-base font-semibold text-[#0B2545] mb-2">Rental Requirements</h2>
                  <ul className="text-sm text-[#1A1A18] list-disc list-inside space-y-1">
                    <li>Valid driver's license</li>
                    <li>Driver must be 21+ years old</li>
                    <li>Credit card for deposit (or wallet balance)</li>
                    <li>Minimum 1-day rental</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-xl border border-[#E2DFD9] bg-white p-5 shadow-sm lg:sticky lg:top-24 self-start">
                <h2 className="text-lg font-display font-bold text-[#0B2545] mb-4">
                  Rent This Vehicle
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0F0F0E] shadow-sm transition-all duration-200 hover:bg-[#F5E7C7] hover:shadow-md"
                >
                  Book Rental — ${vehicle.dailyRateUsd}/day
                </button>
                <p className="mt-2 text-center text-xs text-[#7D7A74]">
                  Free cancellation up to 24h before pickup
                </p>
              </div>
            </div>

            {modalOpen && <BookVehicleModal vehicle={vehicle} onClose={() => setModalOpen(false)} />}
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <span className="text-4xl">🚗</span>
              <p className="mt-4 text-sm text-[#7D7A74]">Vehicle not found</p>
              <Link
                href="/vehicles"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0B2545] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#081A33]"
              >
                Back to vehicles
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
