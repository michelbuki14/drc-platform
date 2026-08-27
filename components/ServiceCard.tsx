import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';
import { Button } from './Button';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  priceUsd: number;
  duration?: string;
  isActive?: boolean;
}

interface Props {
  service: Service;
  onBook?: (id: string) => void;
}

export function ServiceCard({ service, onBook }: Props) {
  const { t } = useI18n();

  return (
    <div className="group relative rounded-2xl bg-white border border-[#E2DFD9] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#0B2545]/[0.15] hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[#0B2545] group-hover:text-[#D4AF37] transition-colors duration-200">
            {service.name}
          </h3>
          <p className="mt-0.5 text-xs text-[#7D7A74] font-medium uppercase tracking-wide">
            {service.category}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#5C5A54] leading-relaxed line-clamp-2 mb-3">
        {service.description}
      </p>

      {/* Duration if present */}
      {service.duration && (
        <p className="text-xs text-[#7D7A74] mb-3">{service.duration}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E2DFD9]">
        <span className="text-sm font-semibold text-[#8E6D14]">
          ${service.priceUsd.toFixed(2)}
        </span>

        {onBook ? (
          <Button
            onClick={() => onBook(service.id)}
            variant="primary"
            size="sm"
          >
            Book
          </Button>
        ) : service.isActive !== false ? (
          <Link
            href={`/services/book?service=${service.id}`}
            className="text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37] transition-colors duration-200"
          >
            Book Now
          </Link>
        ) : (
          <span className="text-xs text-red-500 font-medium">Unavailable</span>
        )}
      </div>
    </div>
  );
}
