# Wishlist & gift vouchers — design

**Date:** 2026-06-22
**Status:** Approved (pending spec review)
**Area:** Storefront — wishlist, promo codes, purchasable gift cards

## Context

The storefront has a working catalog → cart → checkout → order flow. This adds:

1. A **wishlist** so shoppers can save products for later.
2. **Gift vouchers**, which the user confirmed means **both**:
   - **Promo/discount codes** applied at checkout, and
   - **Purchasable gift cards** (bought as a cart product) with a redeemable balance.

These ship as **three independent PRs**, built in this order (each gated by local CI + the GitHub Actions CI check, merged via PR per the trunk-based workflow):

1. **Wishlist** — fully independent.
2. **Promo codes** — establishes the discount/totals/checkout-code infrastructure.
3. **Gift cards** — extends #2's totals, order schema, and code-entry UI.

---

## PR 1 — Wishlist

Mirrors the cart architecture. Saved at the **product level** (`productId`), not per-variant.

- `src/lib/wishlist/store.ts` — Zustand store persisted to `localStorage`, with
  the same `skipHydration` + `rehydrateWishlist()` on mount and a `hydrated`
  flag, exactly like `lib/cart/store.ts`. State: `items: string[]` (product
  ids). Actions: `toggle(id)`, `add(id)`, `remove(id)`, `has(id)`, `clear()`.
  Selector hooks: `useWishlistIds`, `useWishlistCount`, `useWishlistHydrated`,
  `useIsWishlisted(id)`, `useWishlistActions` (via `useShallow`).
- `src/components/product/wishlist-button.tsx` — heart toggle (filled when
  saved), used on `ProductCard` (overlaid top-right) and the product detail
  page. Hydration-gated so SSR/first paint is consistent. Calls `toggle(id)` and
  fires a sonner toast.
- `src/routes/wishlist.tsx` — grid of saved products with "Add to cart" and
  "Remove"; empty state; `CartSkeleton`-style loading until hydrated. The route
  loader fetches all products once (`getProducts`) and the component filters to
  the wishlisted ids (avoids N server calls).
- `src/components/layout/site-header.tsx` — heart icon + count next to the cart,
  linking to `/wishlist`, hydration-gated like the cart badge.

**Tests:** Vitest for the store (toggle/add/remove/has/dedupe). Playwright smoke:
heart a product → header count → `/wishlist` shows it → add to cart → remove.

---

## PR 2 — Promo codes

### Data (`src/lib/shop/discounts.ts`)

```ts
type DiscountKind = "percent" | "fixed" | "free_shipping"
interface Discount {
  code: string // canonical UPPERCASE
  kind: DiscountKind
  value: number // percent (0-100) or fixed amount; ignored for free_shipping
  minSubtotal?: number
  expiresAt?: string // ISO date
  label: string
}
```

Seed set: `WELCOME10` (10%), `SAVE20` ($20 off), `FREESHIP` (free shipping,
`minSubtotal: 50`). Helpers: `findDiscount(code)` (case-insensitive),
`validateDiscount(code, subtotal): { ok: true; discount } | { ok: false; reason }`,
`discountAmount(discount, subtotal): number`.

### Totals refactor (`src/lib/shop/pricing.ts`)

`computeTotals(items, opts?)` where `opts = { discount?: Discount }`:

- `discountAmount` = `discountAmount(discount, subtotal)` (0 if none).
- `free_shipping` forces `shipping = 0`.
- `tax` is computed on `subtotal − discountAmount` (discounted base).
- `total = (subtotal − discountAmount) + shipping + tax`.
- Returned shape gains `discountAmount`. Existing fields unchanged so current
  callers keep working.

### API (Hono)

`POST /api/discounts/validate` — body `{ code, subtotal }` → `{ discount }` or
`400 { error }`. Order creation **re-validates** the code (never trusts the
client) and recomputes totals server-side.

### Order schema (`src/lib/shop/types.ts`)

Add `discountCode?: string` and `discountAmount: number` (default 0).
`createOrderSchema` accepts optional `discountCode`.

### UI

Checkout gains an **"Apply a code"** field (input + Apply, with applied-state
chip + remove). Order summary shows a **Discount** line when present. The cart
page keeps showing pre-discount totals (codes are entered at checkout).

**Tests:** Vitest for `discountAmount` / `validateDiscount` / `computeTotals`
with a discount (percent, fixed, free_shipping, minSubtotal gate, expiry).
Playwright smoke: apply `WELCOME10` → discount line + lower total.

---

## PR 3 — Gift cards

### Product

A seed product `kind: "gift_card"` ("Evergreen Gift Card") with denomination
variants ($25 / $50 / $100). To support this, `Product` gains an optional
`kind?: "standard" | "gift_card"` (defaults to `"standard"`); standard rendering
is unaffected. Gift-card products skip the wishlist heart and show a short
"delivered as a code" note on the PDP.

### Store (`src/server/giftcards.ts`, file-backed like orders)

```ts
interface GiftCard {
  code: string // e.g. "GIFT-XXXX-XXXX"
  initialBalance: number
  balance: number
  currency: string
  createdAt: string
}
issueGiftCard(amount): GiftCard
getGiftCard(code): GiftCard | undefined
redeemGiftCard(code, amount): { applied: number; balance: number }
```

Persisted to `.data/giftcards.json` (same load/persist pattern as
`server/orders.ts`).

### Issuance & redemption (in `createOrder`)

- For each gift-card line item (qty n, denomination $X), issue **n** gift cards
  of $X. Issued `{ code, balance }[]` are returned on the order and shown on the
  confirmation page.
- If a `giftCardCode` is supplied, redeem `min(balance, total)` against the
  order, decrement the balance (persisted), and set `amountDue = total − applied`.
  Partial use supported.

### Totals

`computeTotals(items, { discount, giftCardBalance })` additionally returns
`giftCardApplied` and `amountDue = total − giftCardApplied`.

### API (Hono)

`GET /api/giftcards/:code` → `{ balance }` or `404`. Redemption happens at order
creation (re-checks balance server-side).

### Order schema

Add `giftCardCode?`, `giftCardApplied: number` (default 0), `amountDue: number`,
`issuedGiftCards?: { code: string; balance: number }[]`.

### UI

The checkout code field resolves a code as **either** a promo or a gift card
(tries promo, then gift card). One promo **and** one gift card can stack. Order
summary shows **Gift card (−$Y)** and **Amount due**. Confirmation page lists any
**issued** gift-card codes (with a copy affordance).

**Tests:** Vitest for `redeemGiftCard` (partial, exhaustion, unknown code) and
`computeTotals` with a gift card. Playwright smoke: buy a gift card → confirmation
shows an issued code → redeem that code on a new order → amount due drops.

---

## Order schema evolution (summary)

`Order` accretes optional/defaulted fields across PRs 2–3 (`discountCode`,
`discountAmount`, `giftCardCode`, `giftCardApplied`, `amountDue`,
`issuedGiftCards`). All default safely so older persisted orders (validated with
`orderSchema` on read) still parse.

## Error handling

- Invalid/expired/below-minimum codes → inline error at checkout; never block
  rendering. Server re-validates and rejects with a clear message at order time.
- Unknown/zero-balance gift card → "no balance" message; order proceeds without it.
- Gift-card store write failures fall back to the in-memory copy (like orders).

## Testing & CI

Per PR: Vitest unit tests for pure logic + a Playwright smoke against the
production preview (`pnpm preview`), then the full local CI (`typecheck`, `lint`,
`test`, `build`) and the GitHub Actions check before merge.

## Out of scope

- Email delivery of gift-card codes (shown on-screen only; no email system).
- Per-user wishlist/voucher persistence (no accounts yet — all client/seed/file).
- Stacking multiple promos or multiple gift cards on one order.
- Admin UI for managing codes (seed-defined).
