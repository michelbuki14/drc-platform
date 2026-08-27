'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { ServiceCard } from '@/components/ServiceCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FacServ {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  isAvailable: boolean;
  category: string;
  provider?: string;
}

export default function FacilitationServicesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [services, setServices] = useState<FacServ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/facilitation-services')
      .then(r => r.json())
      .then(data => {
        setServices(data.services || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBook = (serviceId: string) => {
    router.push(`/facilitation-services/book?service=${serviceId}`);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">{t('loading')}</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">{t('facilitation.title') || 'Facilitation Services'}</h1>
      {services.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No facilitation services available yet.</p>
          <Link href="/facilitation" className="text-primary hover:underline">View Facilitation</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(s => (
            <ServiceCard key={s.id} service={s} onBook={handleBook} />
          ))}
        </div>
      )}
    </div>
  );
}
