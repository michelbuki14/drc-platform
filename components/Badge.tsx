'use client';

import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'sm' | 'md';
  pill?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', pill = true, className = '', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-[#E2DFD9] text-[#5C5A54] border border-[#C9C5BC]',
      primary: 'bg-[#0B2545]/[0.08] text-[#0B2545] border border-[#0B2545]/[0.15]',
      accent: 'bg-[#D4AF37] text-[#0F0F0E] border border-[#D4AF37]',
      success: 'bg-[#E8F3EC] text-[#1B4D2E] border border-[#9AC09E]',
      warning: 'bg-[#FEF3C7] text-[#D97706] border border-[#F5E7C7]',
      error: 'bg-[#FEE2E2] text-red-600 border border-red-200',
      info: 'bg-[#EBF0FA] text-[#3E629B] border border-[#93ABD5]',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-[10px] tracking-wide',
      md: 'px-2.5 py-0.5 text-xs font-semibold',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-semibold rounded-full
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

export default Badge;
