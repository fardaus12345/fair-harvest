# Fair Harvest Web

Full-stack Next.js app for the Fair Harvest agricultural marketplace: customer/farmer
accounts, Government Farmer Card verification, product listings, cart/checkout, order
tracking, and an admin dashboard. The backend lives in this same app as Next.js Route
Handlers under `app/api/v1/**`, backed by Prisma + SQLite - no separate API server to run.

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
| Consumer | `demo@fairharvest.com` | `FairHarvest123` | Has an existing order to view under `/orders` |

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

## Tests

```bash
npm run lint                        # in fair-harvest-web
cd ../fair-harvest-sdk && npm test  # SDK contract tests
```

The app expects the API at `NEXT_PUBLIC_API_BASE_URL` (used by the SDK client) and
`NEXT_PUBLIC_API_URL` (used by `lib/api.js`) - both point at this same app's own address
by default (see `.env.example`).
