'use client';

import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'bordered' | 'premium';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', hover = false, className = '', children, ...props }, ref) => {
    const variantClasses = {
      elevated: 'bg-white border border-[#E2DFD9] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
      flat: 'bg-[#FAF8F3] border border-[#E2DFD9] rounded-2xl',
      bordered: 'bg-white border-2 border-[#0B2545]/[0.15] rounded-2xl',
      premium: 'bg-white border border-[#E2DFD9] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
    };

    const hoverClasses = hover
      ? 'transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#0B2545]/[0.15]'
      : '';

    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${hoverClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`flex items-center justify-between mb-4 ${className}`} {...props}>
      {children}
    </div>
  )
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`font-display text-xl font-bold text-[#0B2545] ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => (
    <p ref={ref} className={`text-sm text-[#7D7A74] mb-2 ${className}`} {...props}>
      {children}
    </p>
  )
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-end gap-3 pt-4 border-t border-[#E2DFD9] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

export default Card;
