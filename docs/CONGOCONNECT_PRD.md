# CongoConnect — Platform Product Requirements Document

**Version:** 1.0  
**Status:** Production-ready  
**Last updated:** August 2026  
**Product owner:** miche  
**Engine:** upstage/solar-pro4:free via No>

---

## 1. Purpose

**CongoConnect** is an all-in-one travel, cargo logistics, and passenger facilitation platform for the Democratic Republic of the Congo (DRC) and its regional trade partners. It unifies flight booking, cargo shipping, airport transfers, hotel reservations, car rentals, facilitation services, and business operations into a single trusted digital ecosystem.

**Problem statement:**  
Travelers, businesses, cargo operators, and airlines in the DRC currently navigate fragmented tools — WhatsApp for bookings, phone calls for cargo quotes, cash payments without receipts, no centralized trip management, and no partner visibility. CongoConnect replaces that fragmentation with one branded, trusted platform.

---

## 2. Vision

> "The trusted DRC travel ecosystem."

A premium, modern, trustworthy digital product that feels like it could compete with Air France, Booking.com, or a Stripe-quality logistics tool — while being unmistakably rooted in Congolese identity through color, typography, and lived experience.

**Brand values:** Trust, Reliability, Luxury, Innovation, Performance, Security, Elegance, Professionalism, Global quality.

---

## 3. Scope

### User segments

| Segment | Needs |
|---|---|
| **Travelers** | Book flights, see trips, manage boarding passes, track payments, set preferences |
| **Cargo customers** | Request shipment, get instant quote, track milestones, view history |
| **Partners (agencies, airlines, cargo companies)** | Sales dashboard, commissions, manage availability, CRM |
| **Ops / airlines / airport** | Departure board, fleet, crew, check-in, boarding, cargo control |
| **Admin (backoffice)** | KPIs, partner management, refunds, payouts, audit logs |

### Offerings

- **Flights** — search, results, seat-select booking, ticket issuance, boarding pass, check-in, void
- **Cargo** — shipment request, instant quote, pickup scheduling, tracking, milestones, history, invoices
- **Facilitation** — airport pickup, meet & assist, interpreter, travel docs guidance, local transport, concierge
- **Accommodations** — hotels browse + book, vehicles rent, insurance
- **Payments** — wallet, saved cards, M-Pesa, Airtel Money, Orange Money, bank transfer, invoices, refunds
- **Auth** — sign in, RBAC roles, demo accounts
- **i18n** — English + French live; Lingala, Swahili, Tshiluba, Kikongo structure reserved
- **Notifications** — travel alerts, cargo updates, payment confirmations, promotions

---

## 4. Information Architecture

```
/                          Homepage (hero + search + value props + stats + ops CTA)
/flights                   Flight search (results + seat booking modal)
/trips                     Trip lookup + QR boarding pass + check-in + void
/cargo                     Cargo shipment + quote + tracking + milestones
/facilitation              Assistance · transfers · hotels · concierge · interpreter
/bookings/hotels           Hotel browse
/bookings/vehicles         Car rental browse
/bookings/insurance        Insurance browse
/account                   Traveler dashboard: wallet · payments · transactions · profile
/partner                   Partner portal: sales · commission · manage · CRM
/ops                       Ops console: board · fleet · crew
/backoffice                Admin: KPIs · partner mgmt · refunds · payouts · audit
/pages/success             Post-booking success
/pages/error               Error state
/pages/notifications       Notification center
/api/flights               Flight search API
/api/cities                City/airport reference
/api/auth                  Auth (sign in)
/api/bookings              Booking creation + lookup
/api/tickets               Ticket issuance + lookup
/api/account               Traveler account + wallet
/api/partner               Partner lookup
/api/backoffice            Admin KPIs + data
/api/ops/board             Departure board
/api/ops/fleet             Fleet status
/api/ops/crew              Crew roster
/api/ops/flights           Ops flight management
/api/ops/flights/[id]      Single flight ops
/api/payments/charge       Payment charge endpoint
```

---

## 5. Design System

### Visual Identity

| Token | Value | Use |
|---|---|---|
| Primary blue | `#0B2545` (cc-blue-500) | Headlines, primary buttons, brand |
| Navy | `#060F1F` (cc-blue-900) | Hero backgrounds, dark surfaces |
| Gold accent | `#D4AF37` (cc-gold-300) | CTAs, highlights, DRC warmth |
| Gold soft | `#E8CE7A` (cc-gold-200) | Subtle backgrounds, secondary gold |
| Emerald | `#1B4D2E` (cc-emerald-500) | Success, confirmations |
| Charcoal text | `#1A1A18` (cc-charcoal-900) | Primary text |
| Charcoal muted | `#7D7A74` (cc-charcoal-500) | Secondary text |
| Cream bg | `#FAF8F3` (cc-cream) | Page background |
| White | `#FFFFFF` (cc-white) | Cards, surfaces |

### Typography

- **Display headlines:** Playfair Display + Cormorant Garamond fallback (serif, premium)
- **Body/UI:** Inter + DM Sans fallback (sans, readability)

### Layout

- Max content width: 1280px
- Header height: 68px
- Mobile nav height: 72px
- 8pt spacing grid
- Mobile-first responsive

### Animations

- Page entry: fade-up + scale-in (350ms, ease-out-expo)
- Staggered reveal on scroll (Intersection Observer)
- Float: hero globe, ambient elements
- Pulse-glow: hub markers, CTAs
- Spin-slow: loading indicators

### Accessibility

- WCAG 2.2 AA target
- Keyboard navigation, `focus-visible` rings
- `prefers-reduced-motion` respected
- High contrast text ratios
- ARIA labels on interactive elements
- Semantic HTML, proper heading hierarchy

---

## 6. Component Library

| Category | Components |
|---|---|
| Buttons | btn-primary, btn-primary-lg (gold), btn-secondary, btn-ghost, btn-danger, btn-success, btn-gold-outline |
| Inputs | input, select, textarea, input-group, input-with-action |
| Cards | card, card-hover, card-elevated, card-interactive, card-glass |
| Badges | badge-primary, badge-accent, badge-success, badge-warning, badge-error, badge-neutral, badge-charcoal |
| Chips | chip, chip-active, chip-accent, chip-gold |
| Tables | table, table-row-hover, table-sortable, table-numeric |
| Modals | modal-overlay, modal, modal-header/body/footer, sizes sm–xl |
| Alerts | alert-info, alert-success, alert-warning, alert-error |
| Skeletons | skeleton, skeleton-text, skeleton-title, skeleton-avatar, skeleton-image, skeleton-card, skeleton-button |
| Avatars | avatar (sm–2xl), avatar-group |
| Tabs | tab-list, tab, tab-list-center/right/scroll |
| Accordion | accordion, accordion-item, accordion-header, accordion-body |
| Progress | progress, progress-bar, progress-bar-sm/lg, spinner |
| Tooltips | tooltip-container, tooltip, tooltip-place-* |
| Mobile nav | bottom-nav, bottom-nav-inner, bottom-nav-item |
| QR | qr-container, qr-code, qr-label, qr-ref |
| Empty states | empty-state, empty-state-icon, empty-state-title, empty-state-description, empty-state-action |
| Stars | stars, star, stars-small, stars-count |
| Price | price, price-lg, price-xl, price-sm, price-label, price-delta, price-delta-up/down |
| Flight route | route-line, route-dot, route-dot-dest, route-label |
| Dividers | gold-line, divider, divider-label |
| Layout | container, container-narrow, section, grid-cards |
| Animation | animate-fade-in/up/down, animate-scale-in, animate-slide-left/right, animate-float, animate-pulse-glow, animate-spin-slow, stagger-1–6, reveal, reveal-left |

---

## 7. API Design

### Conventions

- All API routes return `{ count: number, data: any[] }` on success
- Errors return `{ error: string }` or `{ data: { reason?: string } }`
- Auth via API key or session cookie (Supabase or header `X-Api-Key`)
- Pagination via `?limit=20&offset=0` where applicable

### Key endpoints

- `GET /api/flights?from=&to=&date=` — search flights; returns list with priceUsd, departHour, durationMin, seatsAvailable, aircraft, refundable, includesCheckedBaggage
- `POST /api/bookings` — create booking; body: `{ flightId, cabinClass, passengers: [{ name, email, seat? }], seats }`; returns `{ data: { reference, tickets: [{ ticketNo, passengerName, email }] } }`
- `GET /api/tickets?email=` — list tickets for passenger
- `GET /api/account?email=` — account profile, wallet balance, payment methods, transactions
- `PUT /api/account` — top up wallet; body: `{ email, amountUsd }`
- `POST /api/payments/charge` — charge payment; body: `{ email, method, amountUsd, purpose }`
- `GET /api/ops/board` — departure board
- `GET /api/ops/fleet` — fleet status
- `GET /api/ops/crew` — crew roster

---

## 8. Database

**ORM:** Prisma  
**Database:** SQLite (development)  
**Schema location:** `prisma/schema.prisma`

### Key models

- `Flight` — flightNo, airline, originId, destinationId, departHour, durationMin, aircraft, priceUsd, seatsAvailable, refundable, includesCheckedBaggage, isNonstop
- `City` — name, country, latitude, longitude, kind (airport/city), code
- `CargoShipment` — origin, destination, weightKg, dimensions, contents, customerEmail, status, priceUsd
- `Booking` — reference, flightId, passengerName, email, phone, cabinClass, status, tickets[]
- `Ticket` — ticketNo, bookingId, passengerName, email, seat, status, qrCode
- `Payment` — reference, accountId, amountUsd, method, purpose, status, createdAt
- `Partner` — name, email, type (agency/airline/cargo), contact, commissionRate, status
- `User` — email, name, phone, role, profile, preferences
- `OpsBoard` — flightId, status (on-time/delayed/cancelled/boarding/departed), gate, baggage
- `Fleet` — registration, type, name, status, seatsTotal, airline
- `Crew` — employeeNo, name, role, baseAirport, dutyHours, status

---

## 9. Seed Data

Seeded with realistic DRC-relevant data:

- **Airlines:** Congo Airways (CA), Congo Airways Express, CAA, Brussels Airlines, Air France, Ethiopian Airlines, Kenya Airways, RwandAir, ASL Airlines
- **Cities:** Kinshasa (FIH), Lubumbashi (FBM), Goma (GOM), Kisangani (FKI), Brussels (BRU), Paris (CDG), Dubai (DXB), Istanbul (IST), Johannesburg (JNB), Nairobi (NBO), Addis Ababa (ADD), Cairo (CAI)
- **Flights:** 12 seed flights across Kinshasa–Lubumbashi, Kinshasa–Goma, Goma–Kisangani, Congo Airways–Brussels, Dubai–Johannesburg routes
- **Passengers:** Marie Ngalula, Jean Mbuyi, Sophie Tshiyembe, Patrick Okitundu, admin user
- **Partners:** Goma Voyages, Kinshasa Travel Agency, Congo Cargo Ltd, African Logistics, Brussels Link Travels, Sunbird Logistics, East Africa Cargo, Grand Congo Tours, Laurent Tour Operators, Royal Air Chartres (airline partner)
- **Crew:** 9 crew members across Congo Airways fleet
- **Fleet:** 5 aircraft (9S-NXA B737-800, 9S-NXB A320-200, etc.)

---

## 10. Security

- API key / session-based auth for protected routes
- RBAC scaffolding: traveler, partner, ops, admin roles
- Input validation on all form submissions
- Rate limiting considerations (not yet implemented, plan for production)
- Credentials in `.env.local` — never committed
- `.env.example` contains only placeholder keys

---

## 11. Internationalization

- **Library:** next-intl
- **Detection:** cookie `cc-locale` (server-side), localStorage (client-side)
- **Live locales:** `en`, `fr`
- **Reserved:** `ln` (Lingala), `sw` (Swahili), `lu` (Tshiluba), `kg` (Kikongo)
- **Message files:** `lib/messages/en.json`, `lib/messages/fr.json`
- **Client hook:** `useI18n()` — returns `{ locale, setLocale, t }`
- **Server config:** `lib/i18n.ts` — `getRequestConfig`

---

## 12. Non-Functional Requirements

- **Performance:** First Load JS ~229KB shared + page-specific; static pages where possible
- **Responsive:** Desktop (1024px+), tablet (640–1023px), mobile (<640px) — all layouts adapt
- **Mobile:** Bottom nav for mobile, safe-area-inset support
- **Build:** `next build` passes with 0 errors, 27 pages generated
- **TypeScript:** Strict mode, `--noEmit` clean

---

## 13. Deliverables Checklist

- [x] Design system (tokens, components, animations)
- [x] Homepage (hero, search, routes, value props, stats)
- [x] Flights (search, results, seat booking modal)
- [x] Trips (boarding pass, check-in, void)
- [x] Cargo (shipment, quote, tracking)
- [x] Facilitation (assistance, transfers, hotels, concierge, interpreter)
- [x] Bookings (hotels, vehicles, insurance)
- [x] Account (wallet, payments, transactions)
- [x] Partner portal
- [x] Ops console (board, fleet, crew)
- [x] Backoffice (KPIs, partners, refunds, payouts)
- [x] Auth + login UI
- [x] i18n (EN + FR live)
- [x] Payment module (charge, wallet, mobile money)
- [x] Success/error/notifications pages
- [x] Seed data
- [x] Assets (favicon, hero images, brand globe)
- [x] Globe component (three.js)
- [x] Onboarding flow
- [x] PRD + architecture docs

---

## 14. Out of Scope (v1)

- Live票价价格 changes from GDS/GDS integration (static seed pricing)
- Multi-currency display beyond USD (CDF/M-Pesa handling at payment time only)
- Real payment gateway integration (adapter interface ready, mock currently)
- Email/SMS notifications delivery (notification center UI only)
- Full admin user management UI (backoffice scaffolding ready)
- GDS inventory sync (static data, ops console ready for live integration)

---

*End of PRD*
