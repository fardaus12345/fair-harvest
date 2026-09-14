# Fair Harvest Web

Full-stack Next.js app for the Fair Harvest agricultural marketplace: customer/farmer
accounts, Government Farmer Card verification, product listings, cart/checkout, order
tracking, reviews, wishlists, public farmer profiles, farmer-driven product
traceability, rewards, and an admin dashboard (including review moderation). The
backend lives in this same app as Next.js Route Handlers under `app/api/v1/**`, backed
by Prisma + SQLite - no separate API server to run.

## Run

```bash
npm install
cp .env.example .env.local
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open `http://localhost:3000`.

## Demo accounts (from `prisma/seed.mjs`)

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@fairharvest.com` | `Admin123!` | Full admin console at `/admin` |
| Farmer (verified) | `rahim@fairharvest.com` | `Farmer123!` | Auto-verified against the demo Gov Farmer Card registry |
| Farmer (pending) | `karim@fairharvest.com` | `Farmer123!` | Card doesn't match the registry - demonstrates the manual admin review path |
| Consumer | `demo@fairharvest.com` | `FairHarvest123` | Has a DELIVERED order under `/orders` - can leave a review for its product and appears in the farmer's earnings/orders views |

To try the verification flow with a farmer that auto-approves, register a new farmer
account and submit Farmer Card `BD-FARM-0001`, NID `1990123456789`, name `Rahim Uddin`
(or see `prisma/seed.mjs` for the other seeded registry records).

## Architecture notes

- **Database**: SQLite by default (`prisma/dev.db`, gitignored) for zero-setup local use.
  Swap `provider` in `prisma/schema.prisma` to `postgresql` and update `DATABASE_URL` for
  production - no application code changes needed.
- **Auth**: JWT access tokens (`lib/server/auth.js`), stored client-side in `localStorage`
  and sent as `Authorization: Bearer`. See `.env.example` for `JWT_SECRET`.
- **Farmer Card verification**: `lib/server/verification/` implements a provider
  abstraction (`demoRegistryProvider.js` checks the seeded `GovFarmerCardRecord` table;
  `officialGovApiProvider.js` is a stub for a future real Government API). Switch via the
  `VERIFICATION_PROVIDER` env var - no frontend or schema changes required either way.
- **API docs**: `GET /openapi.json` lists all implemented endpoints. `GET /health` and
  `GET /ready` are basic liveness/readiness checks.
- **SDK**: `@fair-harvest/sdk` (in `../fair-harvest-sdk`) is a thin REST client matching
  this API's contract, useful for a future mobile app or third-party integration.
- **Reputation**: `FarmerProfile.reputationScore`/`badge` are computed from real
  signals (verification status, average review rating, delivered-order rate — see
  `lib/server/reputation.js`) and recomputed on verification decisions, new reviews,
  and order status changes. It is never a static seed value read as-is.
- **Traceability**: `TraceEvent` rows are entered by the owning farmer via
  `POST /api/v1/trace/[productId]`. There is no blockchain or external ledger —
  the trace page says so explicitly. No hash or "verified on chain" claim is generated.
- **CORS**: `middleware.js` allows only origins listed in `ALLOWED_ORIGINS` (comma
  separated); with it unset, the API is same-origin only (no wildcard).
- **Demo-only features** (clearly labeled in their own UI, not real integrations):
  Bangla voice upload (canned transcript, no speech-to-text), the food/produce scanner
  (heuristic score from the product name, not real image analysis), and the
  nutrition/DNA/soil/waste/health-prediction endpoints on the homepage (static or
  formula-based, not real AI/lab models).

## Tests

```bash
npm run lint                        # in fair-harvest-web
npm test                            # node --test — pure business-logic unit tests
cd ../fair-harvest-sdk && npm test  # SDK contract tests
```

`npm test` covers reputation scoring, earnings summarization, review eligibility,
identifier masking, and rate limiting — all dependency-free from Prisma/Next, so they
run without a database. Route-level integration tests (auth, ownership/IDOR, full
request/response cycles) require `prisma generate` and a running dev database; run
`npx prisma migrate dev` first if you add those.

The app expects the API at `NEXT_PUBLIC_API_BASE_URL` (used by the SDK client) and
`NEXT_PUBLIC_API_URL` (used by `lib/api.js`) - both default to this same app's own
same-origin `/api/v1` address when unset (see `.env.example`).
