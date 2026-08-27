'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { ServiceCard } from '@/components/ServiceCard';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface FacServ {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  isAvailable: boolean;
  category: string;
  provider?: string;
}

export default function FacServDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const [service, setService] = useState<FacServ | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    fetch(`/api/facilitation-services/${id}`)
      .then(r => r.json())
      .then(data => {
        setService(data.service || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">{t('loading')}</p></div>;

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">{t('facilitation.serviceNotFound') || 'Service Not Found'}</h1>
        <Link href="/facilitation-services" className="text-primary hover:underline mt-4 inline-block">← Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-4">{service.name}</h1>
      <p className="text-sm text-muted-foreground mb-1">{service.category} · {service.isAvailable ? 'Available' : 'Unavailable'}</p>
      {service.provider && <p className="text-sm text-muted-foreground mb-4">Provider: {service.provider}</p>}
      <p className="text-muted-foreground mb-6">{service.description}</p>
      <div className="flex gap-3 mb-6">
        <Link href={`/facilitation-services/book?service=${service.id}`} className="px-6 py-2 rounded-lg bg-primary text-white hover:opacity-90">Book Now</Link>
        <Link href="/facilitation-services" className="px-6 py-2 rounded-lg border border-border hover:bg-muted">Back to List</Link>
      </div>
    </div>
  );
}
