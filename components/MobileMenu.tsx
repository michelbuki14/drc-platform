'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, Role } from './AuthProvider';
import Logo from './Logo';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  traveler: [
    {
      title: 'Travel',
      items: [
        { href: '/flights', label: 'Flights', icon: '✈️' },
        { href: '/airport', label: 'Airport', icon: '🛫' },
        { href: '/hotels', label: 'Hotels', icon: '🏨' },
        { href: '/vehicles', label: 'Vehicles', icon: '🚗' },
        { href: '/tours', label: 'Tours', icon: '🗺️' },
        { href: '/cargo', label: 'Cargo', icon: '📦' },
        { href: '/insurance', label: 'Insurance', icon: '🛡️' },
        { href: '/packages', label: 'Packages', icon: '🎁' },
        { href: '/facilitation', label: 'Assistance', icon: '🤝' },
      ],
    },
    {
      title: 'My Trips',
      items: [
        { href: '/trips', label: 'My Trips', icon: '🧳' },
        { href: '/bookings/CC-101', label: 'Bookings', icon: '🎫' },
        { href: '/group-bookings', label: 'Group Bookings', icon: '👥' },
        { href: '/loyalty', label: 'Loyalty Points', icon: '⭐' },
        { href: '/referrals', label: 'Referrals', icon: '💸' },
        { href: '/price-alerts', label: 'Price Alerts', icon: '🔔' },
        { href: '/account', label: 'Wallet & Account', icon: '👤' },
      ],
    },
  ],
  admin: [
    {
      title: 'Operations',
      items: [
        { href: '/admin/dashboard', label: 'Admin Dashboard', icon: '📊' },
        { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
        { href: '/admin/users', label: 'User Management', icon: '👥' },
        { href: '/ops', label: 'Operations', icon: '⚙️' },
        { href: '/airport-ops', label: 'Airport Ops', icon: '🛬' },
        { href: '/flights', label: 'Flights', icon: '✈️' },
        { href: '/cargo/live', label: 'Live Cargo', icon: '📦' },
      ],
    },
    {
      title: 'Business',
      items: [
        { href: '/partner', label: 'Partner Portal', icon: '🤝' },
        { href: '/airlines', label: 'Airlines', icon: '🛫' },
        { href: '/backoffice', label: 'Back Office', icon: '🏢' },
      ],
    },
  ],
  airline: [
    {
      title: 'Airline',
      items: [
        { href: '/airlines', label: 'Airline Portal', icon: '🛫' },
        { href: '/flights', label: 'Flights', icon: '✈️' },
        { href: '/flight-status', label: 'Flight Status', icon: '📡' },
        { href: '/ops/fleet', label: 'Fleet', icon: '🛩️' },
        { href: '/ops/crew', label: 'Crew', icon: '👨‍✈️' },
      ],
    },
  ],
  airport_ops: [
    {
      title: 'Airport Operations',
      items: [
        { href: '/airport-ops', label: 'Airport Ops', icon: '🛬' },
        { href: '/airport', label: 'Airport Hub', icon: '🏢' },
        { href: '/flight-status', label: 'Flight Status', icon: '📡' },
        { href: '/cargo/live', label: 'Live Cargo', icon: '📦' },
        { href: '/ops', label: 'Operations', icon: '⚙️' },
      ],
    },
  ],
  ops: [
    {
      title: 'Operations',
      items: [
        { href: '/ops', label: 'Operations', icon: '⚙️' },
        { href: '/ops/fleet', label: 'Fleet', icon: '🛩️' },
        { href: '/ops/crew', label: 'Crew', icon: '👨‍✈️' },
        { href: '/flights', label: 'Flights', icon: '✈️' },
        { href: '/flight-status', label: 'Flight Status', icon: '📡' },
        { href: '/cargo/live', label: 'Live Cargo', icon: '📦' },
      ],
    },
  ],
  partner: [
    {
      title: 'Partner',
      items: [
        { href: '/partner', label: 'Partner Portal', icon: '🤝' },
        { href: '/flights', label: 'Flights', icon: '✈️' },
        { href: '/cargo', label: 'Cargo', icon: '📦' },
        { href: '/airlines', label: 'Airlines', icon: '🛫' },
      ],
    },
  ],
  backoffice: [
    {
      title: 'Back Office',
      items: [
        { href: '/backoffice', label: 'Back Office', icon: '🏢' },
        { href: '/backoffice/analytics', label: 'Analytics', icon: '📈' },
        { href: '/admin/dashboard', label: 'Admin Dashboard', icon: '📊' },
        { href: '/customer-service', label: 'Customer Service', icon: '💬' },
        { href: '/flights', label: 'Flights', icon: '✈️' },
      ],
    },
  ],
  agent: [
    {
      title: 'Agent',
      items: [
        { href: '/customer-service', label: 'Customer Service', icon: '💬' },
        { href: '/bookings/CC-101', label: 'Bookings', icon: '🎫' },
        { href: '/flights', label: 'Flights', icon: '✈️' },
        { href: '/account', label: 'Account', icon: '👤' },
      ],
    },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  traveler: 'Traveler',
  admin: 'Administrator',
  airline: 'Airline',
  airport_ops: 'Airport Ops',
  ops: 'Operations',
  partner: 'Partner',
  backoffice: 'Back Office',
  agent: 'Agent',
};

export default function MobileMenu() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const groups = role ? NAV_BY_ROLE[role] : NAV_BY_ROLE.traveler;

  if (!mounted) return null;

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2DFD9] text-[#7D7A74] transition-all duration-200 hover:border-[#0B2545] hover:text-[#0B2545] lg:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-over panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col bg-[#FAF8F3] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2DFD9] px-4 py-4">
          <div className="flex items-center gap-2">
            <Logo size={30} />
            <div className="leading-tight">
              <p className="text-sm font-bold text-[#0B2545]">Congo<span className="text-[#D4AF37]">Connect</span></p>
              {role && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8E6D14]">
                  {ROLE_LABELS[role]}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7D7A74] hover:bg-[#E2DFD9] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7D7A74]">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-[#0B2545]/[0.08] text-[#0B2545]'
                          : 'text-[#5C5A54] hover:bg-[#E2DFD9]'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-[#E2DFD9] px-4 py-4">
          {user ? (
            <div className="space-y-2">
              <p className="text-xs text-[#7D7A74] truncate">{user.email}</p>
              <Link href="/account" className="btn-primary block w-full text-center text-sm bg-[#0B2545] text-white">
                My Account
              </Link>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="btn-ghost block w-full text-sm text-red-600"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/account" className="btn-primary block w-full text-center text-sm bg-[#0B2545] text-white">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
