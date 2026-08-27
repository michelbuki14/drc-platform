'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  country: string;
  starRating: number;
  pricePerNight: number;
  amenities: string | null;
  image: string | null;
  reviewCount: number;
  avgRating: number | null;
}

function HotelCard({ hotel, onBook }: { hotel: Hotel; onBook: (h: Hotel) => void }) {
  return (
    <div className="group relative rounded-2xl border border-[#E2DFD9] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#0B2545]/[0.15] hover:-translate-y-0.5">
      <div className="aspect-[4/3] bg-[#FAF8F3] relative">
        {hotel.image ? (
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-16 w-16 text-[#0B2545]/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-lg bg-[#0B2545]/90 px-2.5 py-1 text-xs text-white font-bold shadow-sm">
          ★ {hotel.starRating.toFixed(1)}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-[#D4AF37] px-2.5 py-1 text-xs text-[#0F0F0E] font-bold shadow-sm">
          ${hotel.pricePerNight}/night
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold text-[#0B2545] truncate group-hover:text-[#D4AF37] transition-colors duration-200">
            {hotel.name}
          </h3>
          {hotel.reviewCount > 0 && hotel.avgRating && (
            <span className="flex items-center gap-1 text-xs text-[#7D7A74] bg-[#FAF8F3] px-2 py-0.5 rounded-full">
              <svg className="h-3.5 w-3.5 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {hotel.avgRating.toFixed(1)} ({hotel.reviewCount})
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-[#7D7A74] truncate">{hotel.address}, {hotel.city}</p>
        {hotel.amenities && (
          <p className="mt-1 text-xs text-[#7D7A74]">
            {hotel.amenities.split(',').map((a: string) => (
              <span key={a} className="inline-block mr-1">{a.trim()}</span>
            ))}
          </p>
        )}
        <button
          type="button"
          onClick={() => onBook(hotel)}
          className="mt-3 w-full rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20"
        >
          Book Hotel
        </button>
      </div>
    </div>
  );
}

export default function HotelsSearchPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minStars, setMinStars] = useState('3');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(false);

  const [booking, setBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    email: '',
    checkIn: '',
    checkOut: '',
    guests: '1',
    roomType: 'standard',
  });
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    if (search) {
      setLoading(true);
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (minStars) params.set('minStars', minStars);

      fetch(`/api/hotels?${params}`)
        .then((r) => r.json())
        .then((data) => setHotels(data.data || []))
        .finally(() => setLoading(false));
    }
  }, [search, city, minPrice, maxPrice, minStars]);

  const handleBook = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setBooking(true);
    setBookingResult(null);
    setBookingForm({
      email: 'dcuser@congoconnect.cd',
      checkIn: '',
      checkOut: '',
      guests: '1',
      roomType: 'standard',
    });
  };

  const submitBooking = async () => {
    if (!selectedHotel || !bookingForm.checkIn || !bookingForm.checkOut) return;
    setBooking(true);
    try {
      const nights = Math.max(1, Math.ceil(
        (new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime()) / 86400000
      ));
      const totalUsd = selectedHotel.pricePerNight * nights * parseInt(bookingForm.guests);

      const res = await fetch('/api/hotels/[id]', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: selectedHotel.id,
          guestName: 'Demo Guest',
          email: bookingForm.email,
          checkIn: bookingForm.checkIn,
          checkOut: bookingForm.checkOut,
          guests: parseInt(bookingForm.guests),
          roomType: bookingForm.roomType,
          totalUsd,
          userId: 'usr_test001',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingResult({ ref: data.data?.reference, total: totalUsd, status: data.data?.status });
      }
    } catch { /* ignore */ } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
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
              <span className="text-sm text-[#7D7A74] font-medium">Hotels</span>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors">← Home</Link>
              <Link href="/flights" className="text-xs font-medium text-[#7D7A74] hover:text-[#0B2545] transition-colors ml-2">Flights</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-16">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0B2545]">Find & Book Hotels</h1>
          <p className="mt-1.5 text-sm text-[#7D7A74]">Discover accommodations across DRC and Central Africa</p>
          <div className="mt-4 mx-auto h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        {/* Search form */}
        <div className="mb-6 rounded-2xl border border-[#E2DFD9] bg-white p-4 sm:p-6 shadow-sm">
          <div className="grid gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className="label mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => { setCity(e.target.value); setSearch(false); }}
                placeholder="City (e.g. Kinshasa, Goma, Lubumbashi)"
                className="input w-full"
              />
            </div>
            <div>
              <label className="label mb-1.5">Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setSearch(false); }}
                placeholder="$"
                className="input w-full"
              />
            </div>
            <div>
              <label className="label mb-1.5">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setSearch(false); }}
                placeholder="$"
                className="input w-full"
              />
            </div>
            <div>
              <label className="label mb-1.5">Min Stars</label>
              <select
                value={minStars}
                onChange={(e) => { setMinStars(e.target.value); setSearch(false); }}
                className="select input w-full"
              >
                <option value="">Any</option>
                <option value="3">3★</option>
                <option value="4">4★</option>
                <option value="5">5★</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setSearch(true); }}
              className="btn-primary bg-[#0B2545] hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20"
            >
              {loading ? 'Searching…' : 'Search Hotels'}
            </button>
          </div>
        </div>

        {/* Booking modal */}
        {booking && (
          <div className="mb-6 rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#0B2545]">
                Book {selectedHotel?.name}
              </h2>
              <button
                type="button"
                onClick={() => setBooking(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D7A74] hover:bg-[#E2DFD9] hover:text-[#0B2545] transition-colors"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                value={bookingForm.email}
                onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                placeholder="Email address"
                className="input"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label mb-1.5">Check-in</label>
                  <input
                    type="date"
                    value={bookingForm.checkIn}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label mb-1.5">Check-out</label>
                  <input
                    type="date"
                    value={bookingForm.checkOut}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                    min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label mb-1.5">Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="label mb-1.5">Room Type</label>
                  <select
                    value={bookingForm.roomType}
                    onChange={(e) => setBookingForm({ ...bookingForm, roomType: e.target.value })}
                    className="select input w-full"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
              </div>

              {bookingResult && (
                <div className="rounded-xl bg-[#E8F3EC] border border-[#9AC09E] p-4 text-center">
                  <p className="text-sm font-semibold text-[#1B4D2E]">
                    ✅ Booking {bookingResult.ref} confirmed
                  </p>
                  <p className="text-xs text-[#7D7A74] mt-1">
                    Total: ${bookingResult.total.toFixed(2)} · {bookingResult.status}
                  </p>
                  <button
                    type="button"
                    onClick={() => setBookingResult(null)}
                    className="mt-2 text-xs font-medium text-[#0B2545] hover:underline"
                  >
                    Book another
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBooking(false)}
                  className="flex-1 rounded-xl border border-[#E2DFD9] bg-white px-4 py-2.5 text-sm font-medium text-[#7D7A74] hover:bg-[#E2DFD9] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitBooking}
                  disabled={!bookingForm.checkIn || !bookingForm.checkOut}
                  className="flex-1 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0F0F0E] hover:bg-[#F5E7C7] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {booking ? 'Booking…' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
            </div>
          </div>
        ) : hotels.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545]/5 mb-4">
              <svg className="h-7 w-7 text-[#0B2545]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-[#0B2545]">No hotels found</h3>
            <p className="mt-2 text-sm text-[#7D7A74]">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((h) => (
              <HotelCard key={h.id} hotel={h} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
