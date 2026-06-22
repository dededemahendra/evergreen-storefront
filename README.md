# Evergreen — Storefront MVP

A full-stack ecommerce storefront built with **TanStack Start**, **Hono**, **Sanity**, and **shadcn/ui**. It ships with a complete shopping flow — catalog → product detail → cart → checkout → order confirmation — and runs out of the box on a local seed catalog (no external services required).

## Stack

| Concern | Choice |
| --- | --- |
| Framework / SSR | [TanStack Start](https://tanstack.com/start) (Vite plugin, Nitro server) |
| Routing | TanStack Router (file-based, type-safe) |
| Data reads | TanStack Start **server functions** (`createServerFn`) |
| API / mutations | **Hono** mounted at `/api/*` |
| CMS | **Sanity** (with seed-data fallback) |
| UI | **shadcn/ui** + Tailwind CSS v4 + Radix |
| Cart state | **Zustand** (persisted to `localStorage`) |
| Forms / validation | **TanStack Form** + **Zod** |

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

The store runs immediately on the local seed catalog in `src/lib/shop/seed.ts` — no Sanity project or env vars needed.

### Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server on port 3000 |
| `pnpm build` | Production build → `dist/` (client + SSR handler) |
| `pnpm preview` | Serve the production build locally (SSR + API) on port 4173 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `pnpm format` | ESLint / Prettier |
| `pnpm studio` | Run the Sanity Studio locally |

## Architecture

### Data flow

- **Reads** (catalog, products, categories) go through server functions in `src/lib/shop/data.ts`. They run on the server during SSR and as an RPC on client navigation, so the Sanity client and seed data never reach the client bundle.
- The data layer reads from **Sanity** when `VITE_SANITY_PROJECT_ID` is set; otherwise it transparently falls back to the **seed catalog**. The Sanity and seed paths produce the exact same `Product`/`Category` shapes (validated with Zod in `src/lib/shop/types.ts`), so the UI never changes.
- **Orders** are created via the Hono API (`POST /api/orders`) and read back via a server function (`getOrderById`) for the confirmation page.

### API (Hono) — `src/server/api.ts`

| Route | Description |
| --- | --- |
| `GET /api/health` | Health check |
| `POST /api/orders` | Validate (Zod) + create an order, returns the order |
| `GET /api/orders/:id` | Fetch an order by id |

Hono is mounted into TanStack Start by the catch-all server route `src/routes/api.$.tsx`, which delegates every `/api/*` request to `app.fetch(request)`.

### Cart — `src/lib/cart/store.ts`

A Zustand store persisted to `localStorage`. It uses `skipHydration` + a manual rehydrate on mount so the server HTML and the first client render both show an empty cart (no hydration mismatch); the persisted cart loads right after.

### Project structure

```
src/
  config/site.ts          Brand + nav config
  routes/                 File-based routes
    __root.tsx            Layout (header/footer), cart hydration, metadata
    index.tsx             Home (hero, categories, featured)
    products/             Catalog + product detail ($slug)
    cart.tsx              Cart page
    checkout.tsx          Checkout (TanStack Form + Zod)
    orders/$orderId.tsx   Order confirmation
    api.$.tsx             Mounts the Hono app
  components/
    layout/ product/ cart/  Feature components
    ui/                     shadcn/ui primitives
  lib/
    shop/                 Types, pricing, seed, Sanity client, queries, data
    cart/                 Cart store
    orders/               Order client + server-fn reader
  server/
    api.ts orders.ts      Hono app + order store
sanity/                   Studio schemas (product, category)
sanity.config.ts          Studio config
```

## Connecting Sanity (optional)

The storefront runs on seed data until a Sanity project is configured; once
`VITE_SANITY_PROJECT_ID` is set, the data layer reads live content instead.

1. Create a Sanity project (`pnpm dlx sanity@latest init`) or use an existing one.
2. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SANITY_PROJECT_ID=your_project_id
   VITE_SANITY_DATASET=production
   SANITY_STUDIO_PROJECT_ID=your_project_id
   SANITY_STUDIO_DATASET=production
   SANITY_API_WRITE_TOKEN=sk... # Editor token (manage.sanity.io → API → Tokens), seeding only
   ```
3. **Seed the catalog** into Sanity (uploads images as assets, idempotent):
   ```
   pnpm seed:sanity
   ```
   Or manage content by hand in the Studio: `pnpm studio` (schemas in `sanity/schemaTypes/`).
4. Restart `pnpm dev` — the storefront now reads live content from Sanity. The
   `SANITY_API_WRITE_TOKEN` is only needed for seeding, never at runtime.

## Deployment

`pnpm build` emits the client assets and an SSR request handler at `dist/server/server.js` (a fetch-style handler, not a standalone listener). Use `pnpm preview` to run it locally, or deploy via a [TanStack Start hosting preset](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) for your platform (Node, Cloudflare, Vercel, etc.).

## MVP notes / next steps

- **Payments are stubbed.** `POST /api/orders` marks orders as `paid` without charging. The Stripe integration seam is marked with a `TODO(payments)` in `src/server/orders.ts`.
- **Orders are stored on disk** at `.data/orders.json` (good enough for the demo; survives restarts). Swap `src/server/orders.ts` for a database or a Sanity write client for production.
- Tax (8% flat) and shipping (free over $75, else $9) live in `src/lib/shop/pricing.ts`.
