'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Hotel {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  stars: number;
  address: string;
  city: string;
  country: string;
  image: string;
}

interface BookingForm {
  checkIn: string;
  checkOut: string;
  guests: string;
}

export default function HotelPage() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('id') || '';
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    checkIn: '',
    checkOut: '',
    guests: '1',
  });
  const [booking, setBooking] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    async function fetchHotel() {
      if (!hotelId) return;
      try {
        const res = await fetch(`/api/hotels?id=${hotelId}`);
        if (res.ok) {
          const data = await res.json();
          setHotel(data);
        }
      } catch (error) {
        console.error('Failed to fetch hotel:', error);
      }
      setIsLoading(false);
    }
    fetchHotel();
  }, [hotelId]);

  const nights = hotel && bookingForm.checkIn && bookingForm.checkOut
    ? (new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    : 0;

  const totalPrice = hotel && nights > 0
    ? (hotel.pricePerNight || 0) * nights * (parseInt(bookingForm.guests || '1') || 1)
    : 0;

  const handleBook = async () => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return;
    setBooking(true);
    // booking logic
    setBooking(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
          </div>
          <p className="text-sm text-[#7D7A74]">Loading hotel…</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#FAF8F3]">
        <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3">
            <Link href="/hotels" className="flex items-center gap-1.5 text-sm text-[#7D7A74] hover:text-[#0B2545] transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              Hotels
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545]/5 mx-auto mb-4">
            <svg className="h-7 w-7 text-[#0B2545]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">Hotel not found</h1>
          <p className="mt-2 text-sm text-[#7D7A74]">This hotel may no longer be available.</p>
          <Link href="/hotels" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#081A33] hover:shadow-md">
            Browse all hotels
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-3">
          <Link href="/hotels" className="flex items-center gap-1.5 text-sm text-[#7D7A74] hover:text-[#0B2545] transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Hotels
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 pb-16">
        {/* Back */}
        <div className="mb-4 flex items-center justify-between">
          <Link href="/hotels" className="flex items-center gap-1.5 text-sm text-[#7D7A74] hover:text-[#0B2545] transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            All Hotels
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37] text-xs font-bold text-[#0F0F0E]">
              {hotel.stars.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Hero image + details */}
        <div className="rounded-2xl border border-[#E2DFD9] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="relative aspect-[4/3]">
            {hotel.image ? (
              <img
                src={hotel.image}
                alt={hotel.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#FAF8F3]">
                <svg className="h-24 w-24 text-[#0B2545]/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-[#0B2545] shadow-sm backdrop-blur-sm">
                {hotel.city}, {hotel.country}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545] leading-tight">
                  {hotel.name}
                </h1>
                <p className="mt-1 text-sm text-[#7D7A74]">{hotel.address}</p>
                {hotel.description && (
                  <p className="mt-2 text-sm text-[#7D7A74] leading-relaxed">{hotel.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[#7D7A74] uppercase tracking-wider">Price</p>
                <p className="mt-1 font-display text-3xl font-bold text-[#D4AF37]">
                  ${hotel.pricePerNight.toFixed(0)}
                </p>
                <p className="text-xs text-[#7D7A74]">/ night</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking summary */}
        <div className="mt-4 rounded-2xl border border-[#E2DFD9] bg-[#FAF8F3] p-4 sm:p-5">
          <div className="flex items-center gap-4 text-sm text-[#7D7A74]">
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0B2545]" />
              <span>{hotel.city}</span>
            </div>
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
              <span>{(hotel.stars || 0).toFixed(1)} stars</span>
            </div>
          </div>

          <hr className="my-4 border-t border-[#E2DFD9]" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#7D7A74]">
              {nights} night{nights !== 1 ? 's' : ''} ×
              ${hotel.pricePerNight.toFixed(2)} ×
              {parseInt(bookingForm.guests || '1')} guest{parseInt(bookingForm.guests || '1') > 1 ? 's' : ''}
            </span>
            <span className="font-display text-lg font-bold text-[#0B2545]">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Booking form */}
        <div className="mt-4 rounded-2xl border border-[#E2DFD9] bg-white p-4 sm:p-5 shadow-sm">
          <h2 className="font-display text-base font-bold text-[#0B2545] mb-4">Book this hotel</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#7D7A74] mb-1">Check-in date</label>
              <input
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7D7A74] mb-1">Check-out date</label>
              <input
                type="date"
                value={bookingForm.checkOut}
                onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7D7A74] mb-1">Guests</label>
              <input
                type="number"
                min={1}
                max={20}
                value={bookingForm.guests}
                onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                className="w-full rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm text-[#1A1A18] shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setBooking(false)}
              className="flex-1 rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm font-medium text-[#7D7A74] hover:bg-[#E2DFD9] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBook}
              disabled={!bookingForm.checkIn || !bookingForm.checkOut}
              className="flex-1 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0F0F0E] hover:bg-[#F5E7C7] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {booking ? 'Booking…' : 'Book Now'}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#7D7A74]">
          Free cancellation up to 24h before check-in
        </p>
      </div>
    </div>
  );
}
