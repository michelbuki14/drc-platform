'use client';

import { useState, useEffect, Suspense } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ServiceDetail({ serviceId }: { serviceId: string }) {
  const { t } = useI18n();
  const [service, setService] = useState<{ id: string; name: string; description: string; priceUsd: number; isAvailable: boolean; category: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      fetch(`/api/facilitation-services/${serviceId}`)
        .then(r => r.json())
        .then(data => {
          setService(data.service || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [serviceId]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;
  if (!service) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-4">Book: {service.name}</h1>
      <p className="text-sm text-muted-foreground mb-1">{service.category}</p>
      <p className="text-muted-foreground mb-6">{service.description}</p>
      <div className="border rounded-xl p-6 mb-6 bg-card">
        <h2 className="text-lg font-semibold text-primary mb-4">Booking Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{service.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{new Date().toLocaleDateString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">10:00</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium">1</span></div>
          <div className="flex justify-between border-t pt-3 mt-3"><span className="text-muted-foreground">Total</span><span className="font-medium text-accent">{service.priceUsd}</span></div>
        </div>
      </div>
      <BookingForm serviceId={serviceId} />
      <Link href="/facilitation-services" className="px-6 py-2 rounded-lg border border-border hover:bg-muted mt-4">Cancel</Link>
    </div>
  );
}

function BookingForm({ serviceId }: { serviceId: string }) {
  const [bookLoading, setBookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<{ id: string } | null>(null);

  const handleBook = async () => {
    if (!serviceId) return;
    setBookLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/facilitation-services/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilitationServiceId: serviceId,
          userId: 'demo-user',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          guests: 1,
          notes: 'Booking from web',
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Booking failed');
      setBooking(data.booking || { id: 'BK-' + Date.now() });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBookLoading(false);
    }
  };

  return (
    <>
      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4">{error}</div>}
      {booking && (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-4">
          Booking confirmed! Reference: {booking.id}
        </div>
      )}
      <button
        onClick={handleBook}
        disabled={bookLoading}
        className="px-6 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
      >
        {bookLoading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </>
  );
}

export default function FacilitationServicesBookPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>}>
      <ServiceDetailInner />
    </Suspense>
  );
}

function ServiceDetailInner() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || '';

  if (!serviceId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Select a Service</h1>
        <p className="text-muted-foreground mb-4">Please choose a facilitation service to book.</p>
        <Link href="/facilitation-services" className="text-primary hover:underline mt-4 inline-block">← Browse Services</Link>
      </div>
    );
  }

  return <ServiceDetail serviceId={serviceId} />;
}