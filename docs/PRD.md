# CongoConnect — Product Requirements Document

**Tagline:** Travel • Cargo • Connect

**Mission:** The most trusted digital ecosystem connecting the Democratic Republic of the Congo (DRC) with the world — travel, cargo logistics, and passenger facilitation — built on trust, reliability, and modern technology.

**Brand:** Premium, original, and ownable. Inspired by Apple's detail, Airbnb's usability, Stripe's clarity, Linear's speed, and Notion's simplicity — CongoConnect establishes its own identity, not a clone.

---

## 1. Product Vision

CongoConnect is a comprehensive digital platform serving individuals, families, businesses, and the Congolese diaspora. Users can search and book flights, request passenger assistance, book airport transfers, arrange cargo shipments, track shipments, reserve hotels, rent vehicles, purchase travel insurance through partners, access concierge services, manage business travel, and connect with verified travel agencies and logistics providers.

Target markets: DRC outbound + inbound travelers (Kinshasa, Lubumbashi, Goma, Kisangani), the Congolese diaspora traveling home, SMEs and families shipping goods, and verified local partners (travel agencies, cargo operators, hotels, transfer companies, insurance providers).

---

## 2. Target Users & Personas

| Persona | Needs | Primary surface |
|---|---|---|
| **Traveler** (individual/family) | Book flights, pay in CDF/local money, get e-ticket, check in, view boarding pass, airport pickup, hotels, insurance | `/`, `/flights`, `/trips`, `/account` |
| **Shipper** | Request cargo shipment, instant quote, schedule pickup, track delivery, customs guidance | `/cargo`, `/account/cargo` |
| **Business manager** | Corporate bookings, multi-seat, expense, approval workflow, analytics | `/account/business` |
| **Verified partner** (agency/cargo/hotel/insurer) | Manage reservations, shipments, inventory, revenue, payouts | `/partner` |
| **Operations staff** (airline/airport) | Departure board, fleet, crew, passenger manifest, ground handling | `/ops` |
| **Platform admin** | KPIs, partner approve/suspend, refunds, payouts, audit logs | `/backoffice` |
| **Guest (unauthenticated)** | Search flights, browse cargo quote, read trust content | public surfaces |

---

## 3. Information Architecture

### Consumer (traveler / shipper / guest)

```
/                     Home (hero + search + trusted-content)
/flights              Flight search (one-way / round-trip / multi-city)
  /flights?...        Search results (filters: airline/stops/time; sort: price/time/duration)
                      Seat-select booking flow (modal)
/trips                My trips — lookup by booking ref or email; e-tickets + QR boarding passes
  /trips/[ref]        (single trip deep link)
/check-in             Check-in & boarding pass (alias to /trips)
/cargo                Cargo — request shipment, instant quote, tracking
  /cargo/[tracking]   Shipment timeline + milestones
/facilitation         Passenger facilitation: airport assistance, transfers, hotels, concierge, interpreter
/hotels               Hotels (partner inventory)
/vehicles             Vehicle rental (partner inventory)
/insurance            Travel insurance (partner products)
/account              Traveler dashboard
  /account/trips
  /account/cargo
  /account/invoices
  /account/notifications
  /account/payment-methods
  /account/profile
  /account/rewards
  /account/business
```

### Business (partners + ops + backoffice)

```
/partner              Partner portal (agencies, cargo operators, hotels, insurers)
/ops                  Operations console
  /ops/flights        Departures board
  /ops/fleet          Fleet
  /ops/crew           Crew
/backoffice           Platform backoffice (admin KPIs, partner mgmt, refunds, payouts)
```

### Shared

```
/success              Booking / payment / shipment confirmation
/error                Error state
```

---

## 4. User Flows

### 4.1 Flight booking (traveler)

1. Guest lands on `/` → hero search (trip type: one-way/round-trip/multi-city, from, to, date(s), cabin, pax)
2. Search → `/flights?...` → results with airline filter + stops filter + sort (price/time/duration) + seat-select booking
3. Book → modal: passengers, seat selection, fare class, baggage → submit → e-ticket issued (NX-xxxxxx per passenger)
4. Confirmation → `/success` then `/trips?ref=...` → QR boarding pass
5. Check-in at `/trips` (one-tap) → status `used`
6. Void option at `/trips` (cancel/refund) → status `voided`

### 4.2 Cargo shipment (shipper)

1. `/cargo` → request form: origin, destination, weight, category, pickup date, pickup address, notes
2. **Instant quote** computed from weight + distance + category + mode → displayed immediately (no wait)
3. Submit request → shipment record created with status `requested`
4. Partner assigns → `quote_issued` milestone → shipper confirms → `confirmed`
5. Pickup scheduled → `pickup_scheduled` → in transit → customs → `delivered`
6. Tracking at `/cargo?tracking=...` → milestones timeline + ETA estimate
7. Notifications at each milestone via in-app + email (future: SMS/USSD)

### 4.3 Passenger facilitation

1. `/facilitation` → choose: airport assistance / pickup & transfer / hotel / concierge / interpreter
2. Fill request: date, time, location, requirements, preferred contact
3. Submit → `requested` → partner assigned → `accepted` → `scheduled` → `completed` → invoice
4. Dashboard shows facilitation requests + status + invoices

### 4.4 Partner flow (business seller)

1. `/partner` → sign in (email) → dashboard: sales, commission, balance owed
2. Record a sale (flight / ancillary / cargo) → commission credited automatically
3. Cargo partners: accept shipment requests, issue quote, update milestones
4. Hotel partners: manage availability/pricing/promos (future UI)
5. Backoffice issues payouts when partner requests

### 4.5 Business manager flow

1. `/account/business` → corporate profile, approval rules, team
2. Create multi-seat booking with approver → booking held pending approval → approved → e-tickets
3. Expense/report view of bookings

---

## 5. Design System

### 5.1 Visual direction

CongoConnect has its own identity — **not** a Trip.com clone. Elevate the existing brand accent into a premium, warm, grounded Congo palette with a strong typographic voice.

- **Primary:** deep Congo blue (`cc-blue`: #0B2545) — trust, aviation, professional
- **Accent:** Congo gold (`cc-gold`: #D4AF37) — heritage, warmth, premium
- **Secondary:** forest green (`cc-emerald`: #1B4D2E) — DRC landscape, balance
- **Neutral:** charcoal (`cc-charcoal`: #1A1A2E), off-white (`cc-cream`: #FAF8F3)
- **Type:** a refined serif for headlines (Playfair Display), a clean sans for body (Inter/system). Keep the existing display font pairing.

### 5.2 Components

Existing primitives reused and elevated: `card`, `input`, `chip`, `btn-primary`, `btn-secondary`, `gold-line`, `shadow-card/float`. Add:
- `search-card` (hero search pill)
- `flight-card`, `route-chip`
- `boarding-pass` (with QR) — exists
- `cargo-card`, `milestone-timeline`
- `invoice-card`
- `notif-chip`, `badge-status`
- `partner-card`

### 5.3 Motion & accessibility

- Purposeful, subtle motion (transitions, hover lifts) — never distract from booking clarity
- Reduced-motion respected via `prefers-reduced-motion`
- WCAG 2.2 AA target: contrast, focus rings, keyboard nav, screen reader labels on actions

---

## 6. Non-Functional Requirements (current + target)

| Area | Current state | Target (production) |
|---|---|---|
| Auth | Deterministic demo login (demo users in DB) | OAuth2/OpenID Connect + MFA + RBAC (future) |
| Payments | Local mobile money (M-Pesa/Airtel/Orange) + card + wallet, CDF display, deterministic decline test | Modular payment interface; additional providers (Stripe/Visa/MC/Amex/Apple Pay/Google Pay/PayPal) via adapter |
| DB | SQLite/Prisma (dev) | Production Postgres; multi-region target |
| AuthZ | Route-level (partner vs traveler vs ops vs backoffice) | RBAC + scoped tokens |
| Security | OWASP basics (input, params, no secrets in code) | Encrypted sensitive data, rate limiting, audit logging, API security |
| Performance | Next.js SSR + caching, lazy components | Edge caching, optimized media, lazy loading, fast TTFB |
| Reliability | Single-node dev | High-availability target, monitoring, alerting, backup/DR (future) |
| i18n | English only | English + French live; Lingala/Swahili/Tshiluba/Kikongo structure ready |
| Accessibility | Keyboard-navigable, semantic | WCAG 2.2 AA target |

---

## 7. AI Features (direction)

- Intelligent travel assistant (chat) — flight suggestions, rebooking help, baggage rules, facilitation guidance
- Personalized recommendations — based on saved travelers, trip history
- Price alerts — price drop notifications
- Cargo ETA estimates — milestone-based ETA
- Customer support assistant — multilingual, transparent with citations
- **Transparency principle:** AI responses must allow users to verify important travel information (flight numbers, prices, dates).

---

## 8. Localization (i18n)

Languages: English, French (live), Lingala, Swahili, Tshiluba, Kikongo (structure ready).

Coverage: UI labels, validation messages, notification templates, email subjects, PDF contents (boarding pass), customer support content. File-based Next.js i18n routing or client i18n library; content keys in JSON; language switcher in header; per-user language preference stored in profile.

---

## 9. API Architecture

Modular APIs with separation of concerns, each with its own route group:

- `app/api/flights` — search
- `app/api/bookings` — create + issue e-tickets + seat
- `app/api/tickets` — lookup / check-in / void
- `app/api/cargo` — request shipment / quote / milestones / tracking
- `app/api/facilitation` — requests (assistance/transfers/hotels/concierge/interpreter)
- `app/api/hotels` — inventory (future)
- `app/api/vehicles` — rental inventory (future)
- `app/api/insurance` — products (future)
- `app/api/notifications` — in-app + email
- `app/api/partner` — partner sales/commission (exists)
- `app/api/account` — traveler dashboard data
- `app/api/payments/charge` — payment (exists)
- `app/api/auth` — auth (exists)
- `app/api/ops/*` — ops board/fleet/crew (exists)
- `app/api/backoffice` — platform admin (exists)

Payment interface is modular: a `providers` registry mapping `method → providerAdapter` so new providers (Stripe, card networks, Apple/Google Pay, PayPal) plug in through an adapter contract without touching core payment logic.

---

## 10. Database Schema (extension plan)

Existing models retained: City, Flight, Booking, Ticket, Aircraft, Crew, FlightInstance, Passenger, MaintenanceLog, User, PaymentMethod, Transaction, Partner, PartnerSale.

New models to add:

- `Cargo` — shipment requests (requested → quote_issued → confirmed → pickup_scheduled → in_transit → customs → delivered; or cancelled)
- `ShipmentMilestone` — `{id, cargoId, status, location, note, at}`
- `FacilitationRequest` — `{id, userId, type, status, subject, details, date, time, location, notes, contactPhone, partnerId, amountUsd, invoiceRef, createdAt}`
- `Notification` — `{id, userId, type, title, body (i18n key), data, read, at}`
- `Invoice` — `{id, invoiceNo, userId, totalUsd, items, status, paidAt, createdAt}` + `InvoiceLine`
- `SavedTraveler` — `{id, userId, firstName, lastName, passportNo, nationality, dob, email, phone}`
- `Reward` — `{id, userId, points, tier, lastUpdated}` (tBD)
- `CargoPartner` — `{id, name, category, contactEmail, status, services}`
- `Hotel` — `{id, partnerId, name, city, stars, rooms, basePrice, availableFrom, availableTo}`
- `Vehicle` — `{id, partnerId, type, brand, model, seats, transmission, dailyRate, availableFrom, availableTo}`
- `InsuranceProduct` — `{id, partnerId, name, coverage, priceUsd, termsUrl}`

---

## 11. Scope Boundaries (this build)

This release delivers the **CongoConnect rebrand + extension** of the existing aviation platform into a travel + cargo + facilitation premium product:

- CongoConnect branding (identity, tagline, home, metadata)
- Extended schema (Cargo, ShipmentMilestone, FacilitationRequest, Notification, Invoice, SavedTraveler, CargoPartner, Hotel, Vehicle, InsuranceProduct)
- Cargo module (request + instant quote + tracking + milestones) — page + API
- Passenger facilitation module (assistance / transfers / hotels / concierge / interpreter) — page + API
- Traveler dashboard consolidation at `/account` (trips, cargo, notifications, payment methods, profile, saved travelers)
- Business dashboard at `/account/business`
- i18n: English + French live (UI + validation), structure for the four DRC languages
- Partner layer enhancements: cargo partner status, more payment method adapter structure (existing mobile money + card + wallet + bank transfer)
- Elevated design system tokens (CC palette, new component classes)

**Out of scope for this release** (future): OAuth2/MFA/RBAC production auth, hotel/vehicle/insurance inventory UIs and partner dashboards in depth, AI assistant, invoicing as PDF generation, email/SMS/USSD notifications delivery, Postgres migration, multi-region deployment, monitoring/alerting/DR. These are captured in the PRD as the roadmap; the architecture (modular APIs, adapter interface, i18n structure, schema) is built to support them.

---

## 12. Success Criteria (this release)

- Every new module returns 200 from the dev server
- Cargo request + instant quote + milestone timeline render and persist
- Facilitation request (all 5 types) render and persist
- Traveler dashboard shows trips + cargo + notifications + payment methods + profile + saved travelers
- Business dashboard shows corporate profile + bookings
- i18n switcher toggles EN ↔ FR on main surfaces; validation messages localized
- Partner portal records flight/ancillary/cargo sales → commission credited
- Ops and backoffice still work
- `tsc --noEmit` clean; `next build` passes
- No client-side crashes on any landing page (canvas/three.js verified)

---

## 13. Open Decisions (TBD, documented for future)

- **Multi-city search UI** — currently one-way/round-trip only; multi-city booking flow needs a multi-segment search UI (desktop-first).
- **PDF boarding pass + invoice generation** — QR HTML works now; PDF downloadable tickets/invoices via a PDF library in a future step.
- **Payment adapter contract** — defined conceptually; full Stripe/card-network/Apple-Pay/Google-Pay/PayPal adapters need provider keys and webhook handlers.
- **Hotel/vehicle/insurance inventory** — seed data model exists; searchable UI + partner dashboards are future.
- **Auth hardening** — demo login now; OAuth2/OpenID + MFA + RBAC later.
- **Notifications delivery** — in-app now; email/SMS/USSD delivery and templates later.
