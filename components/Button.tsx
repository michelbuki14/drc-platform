'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-[#0B2545] text-white hover:bg-[#081A33] active:bg-[#07152A] shadow-sm shadow-[#0B2545]/20 border-[#0B2545]',
  secondary: 'bg-[#D4AF37] text-[#0F0F0E] hover:bg-[#F5E7C7] active:bg-[#E8CE7A] shadow-sm shadow-[#D4AF37]/20 border-[#D4AF37]',
  gold: 'bg-transparent text-[#8E6D14] border-2 border-[#D4AF37] hover:bg-[#F5E7C7] hover:text-[#0B2545] active:bg-[#E8CE7A]',
  outline: 'border-2 border-[#0B2545] text-[#0B2545] hover:bg-[#0B2545]/10 active:bg-[#0B2545]/20',
  ghost: 'text-[#5C5A54] hover:bg-[#E2DFD9] active:bg-[#C9C5BC] hover:text-[#1A1A18]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-md',
  md: 'px-5 py-2.5 text-sm font-semibold rounded-lg',
  lg: 'px-7 py-3.5 text-base font-bold rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 focus:ring-offset-[#FAF8F3]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant ?? 'primary']}
        ${sizeClasses[size ?? 'md']}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.627 8 8h4zm0 0v4m0 0H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
