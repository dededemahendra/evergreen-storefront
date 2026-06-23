# Replicate the EVASION template homepage onto the Evergreen storefront

**Date:** 2026-06-23
**Status:** Design — awaiting approval
**Scope:** Homepage only (`/`). No other routes change behavior.

## 1. Goal

Replicate the homepage of the `evasion-e-commerce-template` (a Next.js editorial
outdoor-gear landing page) inside the existing **Evergreen** storefront, keeping
the template's layout, sections, and scroll animations **visually faithful** while
changing only:

- **Copy** — rewritten for Evergreen's brand (a curated shop of durable home +
  outdoor goods), generalized away from the template's fictional smart-bottle story.
- **Imagery** — swapped to brand-fit Unsplash photography (no local asset copy).

The template cannot run as-is: it is **Next.js App Router**, the host project is
**Vite + TanStack Start + TanStack Router**. The work is therefore a **mechanical
port**, not a redesign.

## 2. Source and target

| | Template (source) | Evergreen (target) |
|---|---|---|
| Framework | Next.js App Router | Vite + TanStack Start (SSR) + TanStack Router |
| Homepage | `app/page.tsx` (9 sections) | `src/routes/index.tsx` |
| Styling | Tailwind v4 + shadcn + tw-animate-css | **same** (Tailwind v4 + shadcn + tw-animate-css) |
| React | 19 | 19 |
| Icons | lucide-react | lucide-react |
| Path alias | `@/` → repo root | `@/` → `src/` |
| Image | `next/image` | none (needs shim) |
| Link | `next/link` | `@tanstack/react-router` `Link` / `<a>` |
| Font | Inter | Geist Variable (kept) |

Because both sides share Tailwind v4, shadcn tokens, tw-animate-css, React 19, and
the `@/` alias, **section markup and classNames port verbatim**. Only Next-specific
APIs and content strings change.

## 3. Decisions (confirmed with user)

1. **Imagery:** brand-fit Unsplash URLs (no 23 MB of template PNGs copied).
2. **Homepage chrome:** the template's floating pill **header** renders on `/`; the
   existing **global `SiteFooter` is kept** (template's own `FooterSection` is NOT
   ported). The global `SiteHeader` is hidden on `/` only.
3. **Product data:** sections stay **static** like the template — only card copy /
   names / prices are rewritten. No Sanity wiring.
4. **Copy voice:** **generalized** to Evergreen as a home + outdoor goods shop.

## 4. Non-goals / out of scope

- No changes to `/products`, `/cart`, `/checkout`, `/wishlist`, or any other route.
- No global font swap (Geist stays — visually near-identical to Inter for this look).
- No new npm dependencies.
- No wiring of the homepage to real Sanity inventory.
- No dark-mode work (sections use semantic tokens and adapt automatically).
- The existing homepage's dynamic featured-products loader is **removed** (the
  template homepage is static/editorial). Real featured products remain available on
  `/products`. Re-introducing a live product section is a possible follow-up.

## 5. Architecture

### 5.1 The `next/image` shim (the key enabler)

A single drop-in component lets every `<Image … fill />` in the template stay
byte-identical — only the import path changes.

`src/components/home/image.tsx`:

```tsx
import { cn } from "@/lib/utils"
import type { ComponentPropsWithoutRef } from "react"

type ImageProps = Omit<ComponentPropsWithoutRef<"img">, "src" | "alt"> & {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
}

export default function Image({
  src, alt, fill, priority, className, loading, ...props
}: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
      loading={loading ?? (priority ? "eager" : "lazy")}
      {...(priority ? { fetchPriority: "high" as const } : null)}
      {...props}
    />
  )
}
```

- `next/image` `fill` renders an absolutely-positioned image filling its `relative`
  parent. Every section already wraps images in a `relative` container, so the shim
  reproduces this exactly. `object-cover` is supplied by the section's `className`.
- `priority` → eager load + high fetch priority; otherwise lazy.
- Accepts `onLoad` (used by `FadeImage`) via `...props`.

### 5.2 `next/link`

Only `header.tsx` uses `next/link` (the footer is not ported). Conversion:

- Logo + "Shop Evergreen" CTA → TanStack `Link to="/products"` (and `to="/"` for logo).
- In-page hash nav (`#products`, `#technology`, `#gallery`, `#accessories`) → plain
  `<a href="#…">`. Smooth scrolling is enabled via `html { scroll-behavior: smooth }`
  (added to `styles.css`).

### 5.3 `"use client"` directives

Stripped during port. In TanStack Start (Vite, no RSC) they are inert; removing them
avoids confusion. All sections are client components by nature (hooks + scroll
listeners) and run normally.

### 5.4 SSR safety

Every scroll animation accesses `window`/`getBoundingClientRect` **only inside
`useEffect` and event handlers**, never at module or render top level. Under SSR the
first render emits each section's pre-animation initial state (hero text visible,
side columns collapsed, etc.) — the correct "top of page" look — then hydrates. No
SSR guards needed.

### 5.5 Section `id`s and nav anchors

Section `id`s are kept as in the template (`products`, `technology`, `gallery`,
`accessories`, `about`) so the header's hash nav keeps working. Only the **visible
nav labels** are rebranded (ids are not user-visible copy).

## 6. Files

### 6.1 New — `src/components/home/` (isolated; mirrors the template 1:1 minus footer)

| File | From template | Changes |
|---|---|---|
| `image.tsx` | — (new) | `next/image` shim (§5.1) |
| `fade-image.tsx` | `components/fade-image.tsx` | import the shim instead of `next/image`; strip `"use client"` |
| `header.tsx` | `components/header.tsx` | rebrand text; `next/link` → TanStack `Link` + `<a>`; CTA → `/products` |
| `hero-section.tsx` | `sections/hero-section.tsx` | wordmark + tagline copy; 5 images; shim import |
| `philosophy-section.tsx` | `sections/philosophy-section.tsx` | title/eyebrow/desc/chips copy; 2 images; shim import |
| `featured-products-section.tsx` | `sections/featured-products-section.tsx` | heading + 6 cards copy; 6 images; FadeImage import |
| `technology-section.tsx` | `sections/technology-section.tsx` | title words + reveal paragraph; 5 images; shim import |
| `gallery-section.tsx` | `sections/gallery-section.tsx` | 8 images; shim import |
| `collection-section.tsx` | `sections/collection-section.tsx` | heading + 6 product cards copy; 6 images; FadeImage import |
| `editorial-section.tsx` | `sections/editorial-section.tsx` | 4 spec pairs copy; video kept |
| `testimonials-section.tsx` | `sections/testimonials-section.tsx` | statement copy; 1 image; shim import |

`FooterSection` is intentionally **not** ported.

### 6.2 Modified (3)

**`src/routes/index.tsx`** — replace the body. Remove the loader and the
`getFeaturedProducts`/`getCategories` imports. New component renders the template
composition:

```tsx
export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <PhilosophySection />
      <FeaturedProductsSection />
      <TechnologySection />
      <GallerySection />
      <CollectionSection />
      <EditorialSection />
      <TestimonialsSection />
    </>
  )
}
```

(The global `SiteFooter` from `__root.tsx` renders after this automatically.)

**`src/routes/__root.tsx`** — hide the global `SiteHeader` on `/` only; keep
`SiteFooter` everywhere:

```tsx
import { useRouterState } from "@tanstack/react-router"
// …
function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === "/"
  useEffect(() => { rehydrateCart(); rehydrateWishlist() }, [])
  return (
    <div className="flex min-h-svh flex-col">
      {!isHome && <SiteHeader />}
      <main className="flex-1"><Outlet /></main>
      <SiteFooter />
      <Toaster richColors position="top-center" />
    </div>
  )
}
```

**`src/styles.css`** — append the keyframe + utilities the template assumes:

```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
```

And add `scroll-behavior: smooth` to the existing `@layer base { html { … } }` rule.

### 6.3 Assets

None copied. All imagery is remote Unsplash URLs (§8). The Editorial section keeps
the template's hosted video URL (brand-neutral outdoor footage); swappable later.

## 7. Content map (EVASION → Evergreen)

### Header
- Logo `EVASION` → `Evergreen`
- Nav labels: `Products`→`Collections`, `Technology`→`Craft`, `Gallery`→`Gallery`,
  `Accessories`→`Shop` (hrefs/ids unchanged)
- CTA `Buy the product` → `Shop Evergreen` (→ `/products`); mobile `Reserve` → `Shop`

### Hero
- Wordmark `EVASION` → `EVERGREEN`
- Bottom tagline `Lightweight, durable / and adventure-ready.` →
  `Durable, honest goods / made to last a lifetime.`

### Philosophy
- Title `Meet Alpine & Forest.` → `Meet Field & Hearth.`
- Chips `Alpine $299` / `Forest $199` → `Field $145` / `Hearth $98`
- Eyebrow `First generation` → `The flagship pair`
- Desc → `Field & Hearth are everyday essentials designed for modern life — at home
  and on the trail. Durable, natural, and made to be used for years.`

### Featured Products (6 benefit cards, `id="technology"`)
- Heading `Engineered for Excellence. / Designed for Adventure.` →
  `Built to Last. / Made to Be Lived In.`
- Eyebrow `Technology` → `Why Evergreen`
- Cards (`description` label / `title`):
  1. `Durability` / `Built to Last a Lifetime`
  2. `Materials` / `Natural, Honest Materials`
  3. `Craft` / `Thoughtfully Designed`
  4. `Service` / `Free Shipping Over $75`
  5. `Guarantee` / `Lifetime Guarantee`
  6. `Sourcing` / `Responsibly Sourced`

### Technology (dark section)
- Reveal title words `["Technology","Meets","Wilderness."]` → `["Home","Meets","Trail."]`
- Reveal paragraph → `Evergreen goods are made from natural, durable materials and
  built by hands that care. From the kitchen table to the mountain trail, our
  essentials are designed to be used, repaired, and passed down — beautiful in the
  home and ready for the outdoors.`

### Collection (6 product cards, `id="accessories"`)
- Heading `Essential Accessories` → `The Essentials`
- Cards (`name` / `description` / `price`):
  1. `Waxed Canvas Tote` / `Hard-wearing everyday carryall` / `$68`
  2. `Merino Wool Throw` / `Soft, warm, naturally temperature-regulating` / `$120`
  3. `Stoneware Mug Set` / `Hand-glazed, set of four` / `$54`
  4. `Insulated Trail Bottle` / `Stainless steel, keeps cold 24h, 0.75L` / `$38`
  5. `Enamel Camp Mug` / `Chip-resistant, trail-ready` / `$24`
  6. `Packable Field Blanket` / `Wool blend, water-resistant backing` / `$95`

### Editorial (spec grid — repurposed as brand promises)
- `Weight 400g` → `Materials / 100% natural`
- `Capacity 0.5L - 2L` → `Guarantee / Lifetime`
- `Setup 2 min` → `Shipping / Free $75+`
- `Packed size 30 x 15 cm` → `Returns / 30 days`
- Full-width video: keep template's hosted mp4.

### Testimonials (`id="about"`)
- Statement → `Evergreen brings together natural materials and honest craft — made
  for people who want fewer, better things that last, at home and outdoors.`

## 8. Image map (Unsplash; all proven IDs already used by the template or the existing repo)

Format: `https://images.unsplash.com/photo-{id}?q=80&w={w}` (`w=2000` for hero/center
backgrounds, `w=1000` otherwise).

The hero center image carries the white `EVERGREEN` wordmark **with no dark overlay**
(unlike the Technology section). It must be a **low-key / darker** landscape so the
bottom-aligned text stays legible; verify contrast on run and swap if washed out.

| Slot | Photo id | Subject |
|---|---|---|
| Hero center | `1469474968028-56623f02e42e` | low-key landscape (dark enough for white text) |
| Hero left 1 | `1517824806704-9040b037703b` | trail hiking |
| Hero left 2 | `1510312305653-8ed496efae75` | camping under stars |
| Hero right 1 | `1533873984035-25970ab07461` | forest |
| Hero right 2 | `1527004013197-933c4bb611b3` | lake camp |
| Philosophy — Field | `1553062407-98eeb64c6a62` | outdoor goods |
| Philosophy — Hearth | `1584100936595-c0654b55a2e2` | home interior |
| Featured 1 | `1551028719-00167b16eac5` | apparel |
| Featured 2 | `1584100936595-c0654b55a2e2` | home |
| Featured 3 | `1533873984035-25970ab07461` | forest |
| Featured 4 | `1627123424574-724758594e93` | accessories |
| Featured 5 | `1506905925346-21bda4d32df4` | alpine |
| Featured 6 | `1476610182048-b716b8518aae` | forest trail |
| Technology center | `1501555088652-021faa106b9b` | aerial wilderness |
| Technology side 1 | `1476610182048-b716b8518aae` | forest trail |
| Technology side 2 | `1511593358241-7eea1f3c84e5` | mountain peak |
| Technology side 3 | `1506905925346-21bda4d32df4` | alpine |
| Technology side 4 | `1464822759023-fed622ff2c3b` | snow mountain |
| Gallery 1–8 | `1469474968028-56623f02e42e`, `1551028719-00167b16eac5`, `1553062407-98eeb64c6a62`, `1584100936595-c0654b55a2e2`, `1627123424574-724758594e93`, `1533873984035-25970ab07461`, `1506905925346-21bda4d32df4`, `1527004013197-933c4bb611b3` | mixed home + outdoor |
| Collection 1–6 | `1551028719-00167b16eac5`, `1584100936595-c0654b55a2e2`, `1627123424574-724758594e93`, `1553062407-98eeb64c6a62`, `1510312305653-8ed496efae75`, `1527004013197-933c4bb611b3` | lifestyle product shots |
| Testimonials | `1506905925346-21bda4d32df4` | peaks at sunrise |

**Verification step (in the plan):** before finishing, `curl -sI` each unique URL and
confirm HTTP 200; replace any non-200 with another proven id. This guards against a
dead Unsplash id producing a broken image.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Dead Unsplash id → broken image | URL verification step (§8) |
| White hero wordmark low-contrast on bright photo | use a low-key hero image; verify on run (§8) |
| Hosted video URL rot | brand-neutral, acceptable now; swappable; noted as follow-up |
| Hydration mismatch from scroll state | initial state is static and deterministic; window only touched in effects |
| Global header still showing on `/` | `__root.tsx` pathname guard; manual check |
| Double scrollbars / horizontal overflow from gallery/hero | template handles via `overflow-hidden` sticky wrappers; verify on run |
| `lucide-react` icon names (`Menu`, `X`) exist in installed version | present in lucide; verify at typecheck |

## 10. Verification

1. `pnpm typecheck` (or `tsc --noEmit`) — clean.
2. `pnpm lint` — clean (no `next/*` imports remain in `src/`).
3. `grep` confirms no `next/image`, `next/link`, `"use client"`, or `/images/*.png`
   references survive in `src/components/home/`.
4. `pnpm dev` and load `/`:
   - template floating header overlays the hero; global header absent on `/`;
   - all 8 sections render with their scroll animations;
   - global `SiteFooter` appears at the bottom (no template footer);
   - all images load (no broken-image icons);
   - `/products` (and other routes) still show the normal global header.
5. Unsplash URL HTTP-200 sweep (§8).

## 11. Follow-ups (not in this change)

- Optionally wire one section to live Sanity featured products.
- Optionally host the Editorial video on the project's own storage.
- Optionally unify the homepage header with the global header (cart/search access).
