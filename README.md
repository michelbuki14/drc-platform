# CongoConnect — The Trusted DRC Travel Ecosystem

> The operating system for travel, cargo, and facilitation in the Democratic Republic of the Congo. One secure platform where travelers, freight forwarders, and airport operations transact through the same trusted rails.

[![CI](https://img.shields.io/badge/CI-pass-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-15-black)]()

---

## 📄 Key documents
- **[Executive Summary](./EXEC_SUMMARY.md)** — one-page CEO brief.
- **[Investor Deck](./investor-deck.html)** — 10-slide HTML presentation (open in a browser).
- **[Architecture Overview](./docs/ARCHITECTURE.md)** — stack, directory structure, subsystems, current status.
- **[Product Requirements](./docs/PRD.md)** — full PRD.
- **[Platform PRD](./docs/CONGOCONNECT_PRD.md)** — platform-level PRD.

---

## ✨ What's built
- **Travel & cargo:** flights, hotels, tours, vehicles, attractions, packages, insurance; full booking flow with **QR-coded boarding passes**; cargo with **real-time SSE tracking**.
- **Airport Hub (moat):** 17-section airport-services module (assistance, baggage, car rentals, currency, dining, lounges, transport, wifi, maps, shopping…).
- **Commercial engine:** wallet (75/25 split), loyalty, referrals, group bookings, price alerts.
- **Partner API:** API-key auth, scoped read/write, usage metering.
- **Operator consoles:** admin, ops, backoffice dashboards with real revenue analytics.
- **Enterprise security:** HMAC sessions, bcrypt, CSRF, rate-limiting, full RBAC.

---

## 🚀 Quick start
```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
#   - set SESSION_SECRET (required in production)
#   - optional: payment/email/SMS/push provider keys (see .env.example)

# 3. Database
npx prisma generate
npx prisma db push
npm run db:seed        # optional demo data

# 4. Develop
npm run dev            # http://localhost:3000

# 5. Production
npm run build && npm run start
```

### Scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run tsc` | Type-check (`tsc --noEmit`) |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run ci:local` | tsc + lint + build |
| `npm run test:auth` | Auth integration tests (23 assertions) |
| `npm run db:push` / `npm run db:seed` | DB sync / seed |

---

## 🐳 Docker
```bash
docker build -t congoconnect .
docker run -p 3000:3000 -e SESSION_SECRET=... congoconnect
```
The image runs `prisma generate` + `db push` then `npm start`, with a `/api/health` HEALTHCHECK.

---

## 🔐 Security & integrity
- All 32+ protected API routes are verified to reject unauthenticated and cross-user access (401/403).
- Passwords are bcrypt-hashed; legacy SHA-256 accounts upgrade transparently on login.
- Payments and outbound notifications are **env-gated** — external rails return `not_configured` (501) until credentials are provided. Nothing fakes a successful money movement or send.
- CI runs type-check, lint, build, a health-based smoke test, and `npm audit`.

---

## 🐳 Docker
```bash
docker build -t congoconnect .
docker run -p 3000:3000 -e SESSION_SECRET=... congoconnect
```
The image runs `prisma generate` + `db push` then `npm start`, with a `/api/health` HEALTHCHECK.

---

## 📱 Mobile & PWA
CongoConnect is a fully responsive web app — the same code serves desktop and mobile. Mobile hardening applied:
- `viewport` + `themeColor` (light/dark) + `appleWebApp` (standalone, status bar) + `formatDetection` in `layout.tsx`.
- `public/manifest.json` for installable PWA behaviour.
- `MobileMenu` (role-based hamburger) for small screens.
- **Contrast safety** in `globals.css`: `text-white` on a light surface (`bg-white`/`bg-surface`/`bg-gray-*`) flips to dark text so copy is never invisible; a hero scrim guarantees the white hero text is legible over the 3D scene on small screens.

---

## 🧭 Repository layout
```
app/            # Next.js App Router: pages + API routes (106 routes)
components/     # UI (Logo, Header, AuthProvider, MobileMenu, …)
lib/            # session, db, payments, notifications, cache, realtime, logger, partnerAuth, qr
prisma/         # schema + seed
docs/           # Architecture, PRDs
scripts/        # fraud-scan, auto-refund, sync-payments, auth-flow test
.github/        # CI + deploy workflows
```

---

## 🗺️ Roadmap (90 days)
1. **Activate payments** — M-Pesa + Orange Money STK push (DRC is mobile-money first).
2. **Go to market** in Kinshasa + Lubumbashi — airport facilitation is the wedge.
3. **Sign 3–5 anchor partners** onto the API; production hardening (observability, load test).

---

*CongoConnect — The Trusted DRC Travel Ecosystem.*
