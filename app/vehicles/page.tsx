'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

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

function VehicleCard({ vehicle, onBook }: { vehicle: Vehicle; onBook: (v: Vehicle) => void }) {
  return (
    <div className="group relative rounded-2xl border border-[#E2DFD9] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#0B2545]/[0.15] hover:-translate-y-0.5">
      <div className="aspect-[4/3] bg-[#FAF8F3] relative">
        {vehicle.image ? (
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-16 w-16 text-[#0B2545]/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M5 17h14l-2-8H7l-2 8zM5 12l1.5-4h11L19 12M5 12l1.5 4h11L19 12" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-lg bg-[#0B2545]/90 px-2.5 py-1 text-xs text-white font-bold shadow-sm">
          {vehicle.brand} {vehicle.model}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-[#D4AF37] px-2.5 py-1 text-xs text-[#0F0F0E] font-bold shadow-sm">
          ${vehicle.dailyRateUsd}/day
        </div>
      </div>
      <div className="px-4 py-3">
        <h3 className="font-display text-base font-bold text-[#0B2545] truncate group-hover:text-[#D4AF37] transition-colors duration-200">
          {vehicle.name}
        </h3>
        <p className="mt-0.5 text-sm text-[#7D7A74]">{vehicle.brand} {vehicle.model} · {vehicle.category}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#7D7A74]">
          <span className="inline-flex items-center gap-1 bg-[#FAF8F3] px-2 py-0.5 rounded-full">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            {vehicle.transmission}
          </span>
          <span className="inline-flex items-center gap-1 bg-[#FAF8F3] px-2 py-0.5 rounded-full">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M17 10h3M8 10h3M6 10v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3" />
            </svg>
            {vehicle.fuel}
          </span>
          <span className="inline-flex items-center gap-1 bg-[#FAF8F3] px-2 py-0.5 rounded-full">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {vehicle.seats} seats
          </span>
          <span className="inline-flex items-center gap-1 bg-[#FAF8F3] px-2 py-0.5 rounded-full">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            {vehicle.luggageSlots} bags
          </span>
        </div>
        {vehicle.licensePlate && (
          <p className="mt-1 text-xs text-[#7D7A74]">Plate: {vehicle.licensePlate}</p>
        )}
        <button
          type="button"
          onClick={() => onBook(vehicle)}
          className="mt-3 w-full rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0F0F0E] shadow-sm transition-all duration-200 hover:bg-[#F5E7C7] hover:shadow-md"
        >
          Rent Vehicle
        </button>
      </div>
    </div>
  );
}

export default function VehiclesSearchPage() {
  const { t } = useI18n();
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    if (search) {
      setLoading(true);
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (category) params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      fetch(`/api/vehicles?${params}`)
        .then((r) => r.json())
        .then((data) => setVehicles(data.data || []))
        .finally(() => setLoading(false));
    }
  }, [search, city, category, minPrice, maxPrice]);

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
              <span className="text-sm text-[#7D7A74] font-medium">Car Rentals</span>
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
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0B2545]">Rent a Car or Vehicle</h1>
          <p className="mt-1.5 text-sm text-[#7D7A74]">Fleet across DRC — cars, SUVs, vans, trucks</p>
          <div className="mt-4 mx-auto h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        {/* Search form */}
        <div className="mb-6 rounded-2xl border border-[#E2DFD9] bg-white p-4 sm:p-6 shadow-sm">
          <div className="grid gap-4 sm:gap-6">
            <div>
              <label className="label mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => { setCity(e.target.value); setSearch(false); }}
                placeholder="Location"
                className="input w-full"
              />
            </div>
            <div>
              <label className="label mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSearch(false); }}
                className="select input w-full"
              >
                <option value="">Any</option>
                <option value="car">Car</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
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
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setSearch(true)}
              className="btn-primary bg-[#0B2545] hover:bg-[#081A33] hover:shadow-md hover:shadow-[#0B2545]/20"
            >
              {loading ? 'Searching…' : 'Search Vehicles'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#E2DFD9] border-t-[#0B2545] animate-spin" />
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545]/5 mb-4">
              <svg className="h-7 w-7 text-[#0B2545]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M5 17h14l-2-8H7l-2 8zM5 12l1.5-4h11L19 12M5 12l1.5 4h11L19 12" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-[#0B2545]">No vehicles available</h3>
            <p className="mt-2 text-sm text-[#7D7A74]">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onBook={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
