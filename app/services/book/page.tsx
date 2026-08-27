'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { ServiceCard } from '@/components/ServiceCard';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  priceUsd: number;
  currency: string;
  duration?: string;
}

function ServicesBookInner() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || '';

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      fetch(`/api/services/${serviceId}`)
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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">{t('loading')}</p></div>;

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Select a Service</h1>
        <p className="text-muted-foreground mb-4">Please choose a service to book.</p>
        <Link href="/services" className="text-primary hover:underline mt-4 inline-block">Browse Services</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-4">{service.name}</h1>
      <p className="text-sm text-muted-foreground mb-1">{service.category}</p>
      <p className="text-muted-foreground mb-6">{service.description}</p>
      <div className="border rounded-xl p-6 mb-6 bg-card">
        <h2 className="text-lg font-semibold text-primary mb-4">Booking Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service</span>
            <span className="font-medium">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-t pt-3 mt-3">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium text-accent">{service.currency} {service.priceUsd}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Link
          href={`/api/services/book?service=${service.id}`}
          className="px-6 py-2 rounded-lg bg-primary text-white hover:opacity-90"
        >
          Confirm Booking
        </Link>
        <Link href="/services" className="px-6 py-2 rounded-lg border border-border hover:bg-muted">Cancel</Link>
      </div>
    </div>
  );
}

export default function ServicesBookPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>}>
      <ServicesBookInner />
    </Suspense>
  );
}
