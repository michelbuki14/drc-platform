# CongoConnect — Executive Summary

**One-liner:** The trusted digital ecosystem for travel, cargo, and facilitation in the Democratic Republic of the Congo — one platform where travelers, freight forwarders, and airport operations transact through the same secure rails.

---

### The problem
The DRC is Sub-Saharan Africa's largest country by landmass and one of its fastest-growing markets, yet its travel and logistics stack still runs on phone calls, intermediaries, and cash. There is no single wallet, no loyalty, and no real-time visibility into shipments or bookings. **The gap is trust, not demand** — and no one has built the trusted layer.

### The product (built, not a mockup)
- **Travel & cargo:** flights, hotels, tours, vehicles, attractions, packages, insurance — full booking flow with **QR-coded boarding passes** issued and signed at check-in.
- **Cargo:** real-time tracking via a Server-Sent-Events stream with live status broadcast and milestone events.
- **Airport Hub (our moat):** a 17-section airport-services module — assistance, baggage, car rentals, currency, dining, emergency, lounges, transport, wifi, maps, shopping.
- **Commercial engine:** internal wallet (75% airline / 25% commission), loyalty, referrals, group bookings, price alerts.
- **Partner API:** API-key authenticated, scoped read/write, with usage metering — so hotels, agencies, and tour operators plug in and earn commission.
- **Operator visibility:** admin, ops, and backoffice dashboards with real revenue analytics.

### Business model
Take rate on every booking (75/25 wallet split) · partner commission via the API · premium facilitation & cargo services · B2B SaaS for airlines, hotels, and agencies.

### Status (honest)
| Layer | Status |
|---|---|
| Product & platform | ✅ Built, secure, CI-green, builds clean |
| Booking + QR + real-time tracking | ✅ Live & verified |
| Payments (M-Pesa / Orange / card) | ⚡ Integrated & env-gated — live on key wiring |
| Notifications (email / SMS / push) | ⚡ Infrastructure live — sends on key wiring |
| Multi-instance scale | ✅ Redis cache / pub-sub seams in place |

We deliberately built the *rails* so activating real money and messaging is a credentials step, not a rebuild.

### Why now / why us
- **Airport moat:** 17 productized service modules — nobody else has built the airport experience for the DRC.
- **Trust layer:** signed identity, wallet, and real-time tracking — foundational rails competitors would have to rebuild.
- **Flywheel:** every API partner increases supply and lowers acquisition cost.

### 90-day plan
1. **Activate payments** — M-Pesa + Orange Money STK push (DRC is mobile-money first).
2. **Go to market** in Kinshasa + Lubumbashi — airport facilitation is the wedge.
3. **Sign 3–5 anchor partners** onto the API; production hardening (observability, load test).

### The bottom line
A complete, secure, production-shaped platform with a defensible airport-services moat and a monetizable wallet/commission engine. The hard part — trust, identity, real-time, and a unified booking stack for a fragmented market — is already built and verified. **The market is ready. The product is ready. Let's switch it on.**

*CongoConnect — The Trusted DRC Travel Ecosystem*
