'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import { useAuth } from './AuthProvider';

/* ────────────────────────────────────────────────────────────
   CongoConnect Header — premium, lightweight, branded
   ──────────────────────────────────────────────────────────── */

const PRIMARY_NAV = [
  { href: '/flights', label: 'Flights' },
  { href: '/airport', label: 'Airport' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/tours', label: 'Tours' },
  { href: '/cargo', label: 'Cargo' },
  { href: '/insurance', label: 'Insurance' },
  { href: '/packages', label: 'Packages' },
  { href: '/facilitation', label: 'Assistance' },
];

const PORTALS = [
  { href: '/airlines', label: 'Airlines' },
  { href: '/ops', label: 'Operations' },
  { href: '/airport-ops', label: 'Airport Ops' },
];

const MOBILE_NAV = [
  { href: '/', icon: 'M5 3l1.5 1.5L12 8.5V20c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.5L3.5 6.5 2 5l6-6z', label: 'Home' },
  { href: '/flights', icon: 'M17.6 7.6c-.1-1.2-1.1-2.1-2.3-2.2l-3-1c-1.4-.5-2.9-.5-4.3 0L3.1 4.4c-1.2.1-2.2 1-2.3 2.2L2.2 9c-.1 1.2 1 2.2 2.2 2.3l3 3c.6.5 1.3.7 2 .7 1.5 0 2.7-1 3.5-2 .8-1 1.2-2.3 1.1-3.5l-.1-2.9 3.5-3.5c.6-.6 1.5-.6 2.1 0l3.5 3.5c.5.6.5 1.4 0 2l-3-3z', label: 'Flights' },
  { href: '/trips', icon: 'M4 4v16h16V4H4zm2 2h12v2H6V8zm0 4h12v2H6v-2z', label: 'Trips' },
  { href: '/account', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2c-1.5 0-2.7.6-3.6 1.5-.9.9-1.4 2-1.4 3.2s.5 2.3 1.4 3.2c.9.9 2.1 1.5 3.6 1.5s2.7-.6 3.6-1.5c.9-.9 1.4-2 1.4-3.2s-.5-2.3-1.4-3.2c-.9-.9-2.1-1.5-3.6-1.5zm0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z', label: 'Me' },
];

export default function Header() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, role } = useAuth();

  return (
    <>
      {/* ── Desktop header ── */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[var(--max-width-content)] items-center justify-between px-4 sm:px-8">

          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2.5" aria-label="CongoConnect home">
            <Logo size={32} withWordmark />
          </Link>

          {/* Primary nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith(link.href)
                    ? 'bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/20'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <span className="mx-1 h-5 w-px bg-[var(--color-border)]" />
            {PORTALS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith(link.href)
                    ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent-deep)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <span className="mx-1 h-5 w-px bg-[var(--color-border)]" />
            <Link
              href="/partner"
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                pathname.startsWith('/partner')
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent-deep)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10'
              }`}
            >
              Partner
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            {user ? (
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text)] transition-all duration-200 hover:border-[var(--color-primary)] sm:flex"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                {user.name?.split(' ')[0] || 'Account'}
              </Link>
            ) : (
              <Link
                href="/account"
                className="hidden rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-[var(--color-primary)]/20 transition-all duration-200 hover:bg-[var(--color-primary-dark)] hover:shadow-md sm:block"
              >
                Sign in
              </Link>
            )}
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-border-subtle)] bg-white/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-16 max-w-[var(--max-width-content)] items-center justify-around px-2">
          {MOBILE_NAV.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                  active
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.2 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-all duration-200 ${
                    active ? 'text-[var(--color-accent)]' : ''
                  }`}
                >
                  <path d={icon}/>
                </svg>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}