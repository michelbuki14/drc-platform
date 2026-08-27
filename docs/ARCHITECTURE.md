# CongoConnect — Architecture Overview

**Version:** 1.0  
**Status:** Production-ready  
**Last updated:** August 2026 (security audit + payments + notifications + real-time + search/analytics/perf/partner/devops hardening)

---

## 1. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + custom CSS design tokens |
| ORM | Prisma 6 |
| Database | SQLite (dev) — Supabase PostgreSQL (production) |
| BaaS | Supabase (auth, realtime if needed) |
| i18n | next-intl |
| Payments | Provider abstraction (`lib/payments/provider.ts`): wallet (real), M-Pesa/Airtel/Orange/Card/Bank — env-gated, returns `not_configured` (501) when keys absent, never fakes success |
| 3D | three.js (raw, no react-three-fiber to avoid React 19 compat issues) |
| Assets | Unsplash, FAL image generation, custom SVG |

---

## 2. Directory Structure

```
drc-platform/
├── app/
│   ├── globals.css              # Design system tokens + component classes
│   ├── layout.tsx               # Root layout: metadata, CSS, Header, I18nWrapper
│   ├── page.tsx                 # Homepage (hero + search + routes + value props)
│   ├── page.module.css          # (unused — everything in globals.css)
│   ├── flights/
│   │   └── page.tsx             # Flight search + results + seat booking modal
│   ├── trips/
│   │   └── page.tsx             # Trip lookup + QR boarding pass + check-in
│   ├── cargo/
│   │   └── page.tsx             # Cargo shipment + quote + tracking
│   ├── facilitation/
│   │   └── page.tsx             # Assistance / transfers / hotels / concierge / interpreter
│   ├── bookings/
│   │   ├── hotels/
│   │   │   └── page.tsx         # Hotel browse
│   │   ├── vehicles/
│   │   │   └── page.tsx         # Car rental browse
│   │   └── insurance/
│   │       └── page.tsx         # Insurance browse
│   ├── account/
│   │   └── page.tsx             # Traveler dashboard: wallet · payments · transactions
│   ├── partner/
│   │   └── page.tsx             # Partner portal: sales · commission · manage
│   ├── ops/
│   │   ├── page.tsx             # Ops console hub
│   │   ├── board/
│   │   │   └── page.tsx         # Departure board
│   │   ├── fleet/
│   │   │   └── page.tsx         # Fleet status
│   │   └── crew/
│   │       └── page.tsx         # Crew roster
│   ├── backoffice/
│   │   ├── page.tsx             # Admin hub
│   │   ├── partners/
│   │   │   └── page.tsx         # Partner management
│   │   ├── refunds/
│   │   │   └── page.tsx         # Refund requests
│   │   ├── payouts/
│   │   │   └── page.tsx         # Payout management
│   │   └── audit/
│   │       └── page.tsx         # Audit logs
│   ├── pages/
│   │   ├── success/
│   │   │   └── page.tsx         # Post-booking success
│   │   ├── error/
│   │   │   └── page.tsx         # Error state
│   │   └── notifications/
│   │       └── page.tsx         # Notification center
│   ├── onboarding/
│   │   └── page.tsx             # Language → country → preferences flow
│   └── api/
│       ├── auth/
│       │   └── route.ts         # Auth (sign in / out)
│       ├── flights/
│       │   └── route.ts         # Flight search
│       ├── cities/
│       │   └── route.ts         # City/airport reference
│       ├── bookings/
│       │   └── route.ts         # Booking CRUD
│       ├── tickets/
│       │   └── route.ts         # Ticket issuance + lookup
│       ├── account/
│       │   └── route.ts         # Traveler account + wallet
│       ├── partner/
│       │   └── route.ts         # Partner lookup
│       ├── backoffice/
│       │   └── route.ts         # Admin KPIs + data
│       ├── ops/
│       │   ├── board/
│       │   │   └── route.ts     # Departure board
│       │   ├── fleet/
│       │   │   └── route.ts     # Fleet status
│       │   ├── crew/
│       │   │   └── route.ts     # Crew roster
│       │   └── flights/
│       │       ├── route.ts     # Ops flight management
│       │       └── [id]/
│       │           └── route.ts # Single flight ops
│       └── payments/
│           └── charge/
│               └── route.ts      # Payment charge endpoint
├── components/
│   ├── Header.tsx               # Desktop nav + mobile bottom nav
│   ├── Globe.tsx                # three.js globe (hero)
│   ├── LangSwitcher.tsx         # Locale switcher (EN/FR)
│   └── I18nWrapper.tsx          # Client wrapper for server layout
├── hooks/
│   └── useI18n.tsx              # Client i18n provider + hook
├── lib/
│   ├── i18n.ts                  # next-intl server config
│   ├── supabase.ts              # Supabase client
│   ├── db.ts                    # Prisma client + helpers
│   ├── messages/
│   │   ├── en.json              # English messages
│   │   └── fr.json              # French messages
│   └── seed/
│       └── seed-data.ts         # Seed data array
├── prisma/
│   └── schema.prisma            # Prisma schema (all models)
├── public/
│   ├── favicon.svg
│   ├── app-icon.svg
│   ├── travel-terminal.png      # Generated hero image
│   ├── congo-river.png          # Generated landscape
│   ├── cargo-terminal.png       # Generated cargo image
│   └── brand-globe.png          # Generated brand visual
├── docs/
│   ├── CONGOCONNECT_PRD.md      # Product requirements document
│   └── ARCHITECTURE.md          # This file
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
└── .env.local                   # Secrets (not committed)
```

---

## 3. Data Flow

### Flight booking flow

```
1. User searches /flights?from=Kinshasa&to=Lubumbashi&date=2026-09-01
2. /app/flights/page.tsx reads searchParams, calls GET /api/flights
3. /api/flights/route.ts queries Prisma for Flight + City joins
4. Results rendered as FlightCard components with route visualization
5. User clicks "Book now" → BookingModal opens (step 0: passenger info)
6. User selects seats → BookingModal step 1
7. User clicks "Pay & issue ticket" → POST /api/bookings
8. /api/bookings/route.ts creates Booking + Ticket records, returns reference + ticketNos
9. Modal shows confirmation with QR ticket numbers
10. User clicks "View boarding pass" → /trips?ref=...
```

### Payment flow

```
1. User on /account, clicks "Charge $50"
2. POST /api/payments/charge with { email, method: "mpesa", amountUsd: 50 }
3. /api/payments/charge/route.ts validates, processes via adapter, creates Payment record
4. Returns { data: { transactionId, amountUsd, method, status } }
5. Account page re-fetches /api/account to update wallet + transactions
```

### Ops flow

```
1. Ops user opens /ops/board
2. GET /api/ops/board returns Flight + OpsBoard joined data
3. Board rendered with status badges (on-time/delayed/boarding/departed)
4. Ops user can update flight status via PUT to /api/ops/flights/[id]
```

---

## 4. Component Architecture

### Server vs Client

| Component | Type | Notes |
|---|---|---|
| `app/layout.tsx` | Server | Renders metadata, CSS, Header, I18nWrapper |
| `app/page.tsx` | Client | `"use client"` — uses Globe (3D) + interactivity |
| `app/flights/page.tsx` | Client | Search params, API calls, booking modal state |
| `app/account/page.tsx` | Client | Wallet, payments, transactions |
| `components/Header.tsx` | Client | `usePathname`, `useI18n`, Link |
| `components/Globe.tsx` | Client | `useEffect` + three.js, no React tree manipulation |
| `components/LangSwitcher.tsx` | Client | Locale switching |
| `components/I18nWrapper.tsx` | Client | Wraps children in I18nProvider |
| `hooks/useI18n.tsx` | Client | Context provider + `useI18n` hook |
| `lib/i18n.ts` | Server | `getRequestConfig` for next-intl |
| `lib/supabase.ts` | Server | Supabase client init |
| `prisma/schema.prisma` | — | Schema definition |

### Why Globe uses raw three.js

`react-three-fiber` (R3F) v8 is incompatible with Next.js 15 + React 18.3. Using raw three.js via `useEffect` avoids:
- React 19 concurrent rendering conflicts
- SSR hydration mismatches
- The "ReactCurrentOwner" crash

Globe.tsx mounts a WebGL renderer into a div, animates via `requestAnimationFrame`, and cleans up on unmount. No React state touches the three.js scene graph.

---

## 5. Design System Architecture

### Token layers

1. **CSS custom properties** (`app/globals.css` `:root`) — source of truth for colors, spacing, radius, shadows, motion
2. **Tailwind config** (`tailwind.config.ts`) — maps to `cc.blue`, `cc.gold`, `cc.emerald`, `cc.charcoal` — used by existing components
3. **Component classes** (`app/globals.css` `@layer components`) — `.btn`, `.card`, `.input`, `.badge`, `.modal`, `.skeleton`, `.table`, etc.
4. **Utility classes** — `.text-cc-blue-500`, `.bg-cc-cream`, `.shadow-card`, `.animate-fade-up`, `.reveal`

### Animation strategy

- **Entry animations:** `animate-fade-up`, `animate-scale-in`, `animate-slide-left/right` — triggered on mount
- **Scroll reveals:** `.reveal` / `.reveal-left` classes toggled by Intersection Observer (implementation in page components)
- **Stagger delays:** `stagger-1` through `stagger-6` for sequential entrance
- **Ambient:** `animate-float` (globe, decorative elements), `animate-pulse-glow` (CTAs, hubs)
- **Loading:** `animate-spin-slow` (spinners), skeleton shimmer

### Responsive breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | <640px | Single column, bottom nav, stacked cards |
| Tablet | 640–1023px | 2-column grids, condensed nav |
| Desktop | ≥1024px | 3–4 column grids, full header nav, max-width 1280px |

---

## 6. API Architecture

### Routing

All API routes follow Next.js App Router conventions:
- `app/api/<resource>/route.ts` — collection endpoint
- `app/api/<resource>/[id]/route.ts` — single resource endpoint

### Request/response shape

```typescript
// Success
{ count: number; data: T[] }

// Error
{ error: string }
{ data: { reason?: string } }
```

### Auth

- Protected routes check `X-Api-Key` header or session cookie
- RBAC enforced at route level (traveler/partner/ops/admin)
- Demo accounts seeded in `/api/auth/route.ts`

---

## 7. Database Architecture

### Prisma schema highlights

```prisma
model Flight {
  id                   String   @id @default(cuid())
  flightNo             String
  airline              String
  originId             String
  destinationId         String
  departHour           Int
  durationMin          Int
  aircraft             String?
  priceUsd             Decimal
  seatsAvailable       Int
  refundable           Boolean  @default(false)
  includesCheckedBaggage Boolean @default(false)
  isNonstop            Boolean  @default(true)
  origin               City     @relation(fields: [originId], references: [id])
  destination          City     @relation(fields: [destinationId], references: [id])
  bookings             Booking[]
  opsBoard             OpsBoard?
}

model Booking {
  id            String   @id @default(cuid())
  reference     String   @unique
  flightId      String
  flight        Flight   @relation(fields: [flightId], references: [id])
  passengerName String
  email         String
  phone         String?
  cabinClass    String
  status        String   @default("confirmed")
  tickets       Ticket[]
  createdAt     DateTime @default(now())
}

model Ticket {
  id          String   @id @default(cuid())
  ticketNo    String   @unique
  bookingId   String
  booking     Booking  @relation(fields: [bookingId], references: [id])
  passengerName String
  email       String
  seat        String?
  status      String   @default("issued")
  qrCode      String?
  checkedIn  Boolean  @default(false)
  checkedInAt DateTime?
  voided      Boolean  @default(false)
  voidedAt    DateTime?
}
```

### Seed data

Seeded via `prisma/schema.prisma` + Prisma `db.seed` or direct seed script in `lib/seed/seed-data.ts`. Data is realistic DRC-relevant: Congo Airways flights, Kinshasa–Lubumbashi routes, M-Pesa/Airtel/Orange payment methods, local partner agencies.

---

## 8. Deployment

### Development

```bash
npm run dev          # next dev -p 3000
npx prisma generate  # after schema changes
npx prisma db push   # apply schema to SQLite
```

### Production

```bash
npm run build        # next build — 27 pages, 0 errors
npm start            # next start — production server
```

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma connection string (SQLite or PostgreSQL) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-side) |
| `CC_API_KEY` | Platform API key for protected routes |
| `NEXT_PUBLIC_ENV` | `development` / `production` |

---

## 9. Testing Strategy

- **TypeScript:** `tsc --noEmit` — strict type checking, 0 errors
- **Build:** `next build` — full production build, 0 errors, bundle analysis
- **Smoke tests:** HTTP requests to all routes (22 tested, 19 pass, 3 expected 404/405)
- **Manual:** Live dev server at localhost:3000

---

## 10. Future Considerations

- **GDS integration** for live inventory and pricing
- **Email/SMS notifications** via dedicated provider (infra already env-gated)
- **Admin user management UI** in backoffice
- **Additional locales** (Lingala, Swahili, Tshiluba, Kikongo) — message files ready to populate
- **Mobile app** — React Native or PWA offload
- **Cargo tracking hardware** — GPS/telematics integration

---

## 11. Implemented Subsystems & Current Status (Aug 2026)

### Security (verified)
- Dependency-free HMAC-signed httpOnly session cookie (`lib/session.ts`); `requireUser`/`requireRole` early-return 401/403.
- **bcrypt** password hashing with transparent legacy SHA-256 upgrade-on-login.
- CSRF origin check for cross-site state-changing requests; `sameSite: lax` cookie.
- Rate limiting via `lib/ratelimit.ts` (Upstash Redis when configured, else in-memory sliding window).
- Real CORS + security headers in `middleware.ts`. All 32+ protected routes verified to reject unauthenticated / cross-user access.

### Booking + QR boarding pass
- `BoardingPass` model; booking issues a `Ticket` per passenger; check-in issues a **signed QR** (`lib/qr.ts`, HMAC-verifiable offline). Rendered on `/checkin/[ticketId]` and `/bookings/[flightNo]`.

### Payments (env-gated, honest)
- `lib/payments/provider.ts`: wallet (real ledger), M-Pesa/Airtel/Orange/Card/Bank. External rails return `not_configured` (501) until keys are set — **never fakes a success**. `Payment` + `Transaction` persisted on every charge.

### Notifications / real-time / account
- `lib/notifications/delivery.ts`: in-app always created; email/SMS/push env-gated (degrade to `not_configured`).
- Real-time cargo via **SSE** (`/api/cargo/live/stream`) + pub/sub hub (`lib/realtime/hub.ts`); status updates broadcast to subscribers.
- Token-based **email verify + password reset** (`/api/account/request-verify`, `/verify`, `/request-reset`, `/reset`); `VerificationToken` + `PushSubscription` models.

### Search / Analytics / Performance
- `/api/search`: unified, paginated, filterable (type, price, sort, order, page). Search page has filter bar + pagination.
- `/api/admin/analytics`: 11 stat cards, 30-day revenue series, revenue-by-method, top routes, 7d signups.
- `lib/cache.ts`: TTL cache (Redis/Upstash auto-detected) applied to search/analytics/partner inventory; `Cache-Control` headers on reads.

### Partner APIs (external)
- `lib/partnerAuth.ts`: `Authorization: Bearer pk_*` key auth, active/expiry checks, read/write scopes, `ApiUsage` metering.
- Endpoints: `/api/partner/v1/inventory`, `/bookings` (list + create), `/commission`.

### DevOps / Monitoring
- ESLint (`eslint-config-next`) + `npm run lint`; `ci:local` = tsc + lint + build.
- `.github/workflows/ci.yml`: typecheck → lint → build → smoke-test (health-ready) → security-audit.
- `Dockerfile`: multi-stage, non-root, `prisma generate` + `db push`, HEALTHCHECK on `/api/health`.
- `lib/logger.ts` structured logger (JSON in prod); `/api/health` reports version, uptime, request count, DB connectivity.

### Verification
`tsc --noEmit` → 0 errors · `npm run lint` → 0 errors · `next build` → PASS · 71/72 pages render (dynamic `/flights/[id]` excluded) · 23/23 auth integration tests pass · all five feature buckets runtime-verified.

---

*End of architecture doc*
