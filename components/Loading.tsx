'use client';

import { HTMLAttributes } from 'react';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loading({ size = 'md', text, className = '', ...props }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} {...props}>
      <div
        className={`relative animate-spin rounded-full border-2 border-[#E2DFD9] ${sizeClasses[size]}`}
        style={{
          maskImage: 'linear-gradient(to right, transparent 50%, #0B2545 50%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 50%, #0B2545 50%)',
        }}
      />
      {text && <p className="mt-3 text-sm text-[#7D7A74]">{text}</p>}
    </div>
  );
}

export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loading size="lg" text={text} />
    </div>
  );
}

export default Loading;
