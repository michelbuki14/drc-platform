'use client';

import { HTMLAttributes } from 'react';
import Link from 'next/link';
import { Button } from './Button';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  eyebrow?: string;
}

export function PageHeader({ title, description, action, eyebrow, className = '', ...props }: PageHeaderProps) {
  return (
    <div className={`border-b border-[#E2DFD9] bg-white/50 backdrop-blur-sm ${className}`} {...props}>
      <div className="mx-auto max-w-[var(--max-width-content)] px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex items-start justify-between">
          <div>
            {eyebrow && (
              <p className="mb-1 text-xs font-semibold tracking-[0.15em] uppercase text-[#D4AF37]">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545]">{title}</h1>
            {description && (
              <p className="mt-1.5 text-sm text-[#7D7A74]">{description}</p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action.href ? (
                <Link
                  href={action.href}
                  className="btn-cta bg-[#D4AF37] text-[#0F0F0E] hover:bg-[#F5E7C7] hover:text-[#0B2545] px-4 py-2 text-sm"
                >
                  {action.label}
                </Link>
              ) : (
                <Button onClick={action.onClick} variant="primary" size="md">
                  {action.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
