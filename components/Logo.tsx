'use client';

import { forwardRef } from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  /** Show the wordmark next to the icon */
  withWordmark?: boolean;
  /** Use light colors (for dark backgrounds) */
  variant?: 'default' | 'light';
}

/**
 * CongoConnect brand mark — navy globe (Africa-focused) wrapped in gold orbital
 * rings with a central gold hub. Mirrors the official brand identity.
 */
const Logo = forwardRef<HTMLDivElement, LogoProps>(function Logo(
  { size = 32, className = '', withWordmark = false, variant = 'default' },
  ref
) {
  const globe = variant === 'light' ? '#EDEFF2' : '#0B2545';
  const accent = '#D4AF37';
  const ring = '#D4AF37';

  return (
    <div ref={ref} className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="CongoConnect"
        className="shrink-0"
      >
        {/* Globe */}
        <circle cx="32" cy="32" r="18" fill={globe} />
        {/* Continents (simplified, Africa-centric) */}
        <path
          d="M30 18c2 0 3 1 3 3 1-1 3-1 4 0 1 1 0 2-1 3 1 1 2 3 1 4 0 2-2 3-3 3-1 1-2 0-3-1-2 1-4 0-5-1-1-1 0-2 1-3-1-1-1-3 0-4 1-1 3-1 4 0 1 1 0 2-1 3-1 0-2 1-2 2 0 1 1 0 2 1 4 0 0 0 1-1l1 1c1 0 1-1 0-2z"
          fill={variant === 'light' ? 'rgba(11,37,69,0.35)' : 'rgba(255,255,255,0.85)'}
        />
        {/* Orbital rings */}
        <ellipse cx="32" cy="32" rx="29" ry="12" transform="rotate(35 32 32)" stroke={ring} strokeWidth="2.5" fill="none" />
        <ellipse cx="32" cy="32" rx="29" ry="12" transform="rotate(-35 32 32)" stroke={ring} strokeWidth="2.5" fill="none" opacity="0.8" />
        {/* Central gold hub over Africa */}
        <circle cx="32" cy="34" r="4.5" fill={accent} />
      </svg>

      {withWordmark && (
        <span className="text-base font-bold tracking-tight text-[#0B2545]">
          Congo<span className="text-[#D4AF37]">Connect</span>
        </span>
      )}
    </div>
  );
});

export default Logo;
