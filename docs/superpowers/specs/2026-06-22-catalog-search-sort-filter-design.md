# Catalog search, sort & price filter — design

**Date:** 2026-06-22
**Status:** Approved (pending spec review)
**Area:** Storefront catalog (`/products`)

## Context

The Evergreen storefront catalog (`src/routes/products/index.tsx`) currently
supports only category filtering via URL search params (`?category=`) and a row
of filter pills. Shoppers can't search for a product by name, reorder results,
or narrow by price. This feature adds **text search**, **sort**, and a **price
range filter** to the catalog, alongside the existing category pills, so users
can find products quickly.

Decisions already made with the user:

- **Controls:** text search, sort, price range. (In-stock toggle was
  considered and deliberately excluded.)
- **Layout:** a top toolbar (search + sort + price) above the grid; category
  pills remain below it.
- **Architecture:** URL-driven state with client-side filtering (option A below).

## Approach

**Chosen: URL-driven state + client-side filtering.**

All controls live in the URL search params. The route loader keeps
`loaderDeps: { category }`, so changing search/sort/price does **not** re-run the
loader — there is no server round-trip when the shopper types or sorts. The
component reads the params via `Route.useSearch()` and computes the
filtered+sorted list client-side from the already-loaded products. Because the
search params are available during SSR, the first server-rendered HTML already
reflects the active filters.

Benefits: shareable/bookmarkable URLs, back-button friendly, SSR-correct,
instant typing. Filtering a catalog-sized list (tens to low hundreds of
products) client-side is negligible.

Alternatives rejected:

- **Fully server-side** (extend `getProducts`, add all params to `loaderDeps`):
  scales to huge catalogs but adds a server round-trip per keystroke (laggy
  search-as-you-type) and more GROQ complexity. Revisit only if the catalog
  grows into the thousands.
- **Pure local `useState`** (not in URL): simplest, but not shareable, lost on
  reload, no SSR reflection, breaks the back button.

## Data / URL model

Extend `validateSearch` in `src/routes/products/index.tsx`:

```ts
type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name"

type ProductSearch = {
  category?: string // existing
  q?: string // search query
  sort?: ProductSort
  minPrice?: number
  maxPrice?: number
}
```

`ProductSort` is the shared union used by both `ProductSearch` and
`CatalogControls` below.

Rules:

- `validateSearch` coerces and validates each param; unknown/empty values are
  dropped so the URL stays clean (e.g. no `?q=` when search is empty, no
  `sort=featured` when sort is the default).
- `loaderDeps` continues to depend on **`category` only**. The loader still
  fetches the (optionally category-filtered) product set via the existing
  `getProducts` server function; search/sort/price never trigger it.
- `sort` defaults to `"featured"` when absent (mirrors the current default
  order: `featured desc, title asc`).

## Components & units

### `src/lib/shop/catalog.ts` (new, pure, testable)

```ts
export interface CatalogControls {
  q?: string
  sort?: ProductSort
  minPrice?: number
  maxPrice?: number
}
export function filterAndSortProducts(
  products: Product[],
  controls: CatalogControls,
): Product[]
export function getPriceBounds(products: Product[]): { min: number; max: number }
```

- **Search match:** case-insensitive substring against `title`, `description`,
  and `tags`. Empty/whitespace `q` matches everything.
- **Price filter:** on the product's base `price` (the displayed/headline
  price), inclusive of `minPrice`/`maxPrice` when provided.
- **Sort keys:**
  - `featured` — `featured` first, then `title` A→Z (current behavior)
  - `price-asc` / `price-desc` — by base `price`
  - `rating` — by `rating` desc (undefined ratings sort last)
  - `name` — `title` A→Z
- Pure functions with no React/store deps → unit-testable in isolation.

### `src/components/product/catalog-toolbar.tsx` (new)

A presentational toolbar reading current values and emitting changes through a
single `onChange(partial)` callback (the route owns URL writes):

- **Search** — `Input` with a leading search icon. Local state mirrors the URL
  `q` for instant typing; debounced (~300 ms) write to the URL using
  `navigate({ replace: true })` so keystrokes don't spam history.
- **Sort** — shadcn `Select` with the five options.
- **Price** — shadcn `Popover` containing a `Slider` (range) bounded by
  `getPriceBounds(products)`, plus the selected range label. Applying updates
  `minPrice`/`maxPrice`; values equal to the bounds are omitted from the URL.

New shadcn components to add: `select`, `popover`, `slider`.

### `src/routes/products/index.tsx` (modified)

- Extend `validateSearch` to the model above.
- Read all params via `Route.useSearch()`; compute
  `filterAndSortProducts(products, controls)` for the grid.
- Render `<CatalogToolbar>` above the existing category pills; show the result
  count from the filtered list.
- Provide a `setSearch(partial)` helper using `Route.useNavigate()` that merges
  params and omits empties.
- The existing "No products found." empty state (in `ProductGrid`) covers the
  no-match case.

## Data flow

1. User edits a control → `CatalogToolbar` calls `onChange(partial)`.
2. Route merges into URL search params (`navigate`, `replace` for search text).
3. `Route.useSearch()` re-renders the component with new params (no loader run).
4. `filterAndSortProducts(loadedProducts, controls)` recomputes the grid.
5. On a fresh load / shared URL, SSR runs the same computation so the initial
   HTML already reflects the filters.

## Error / edge handling

- Invalid/garbage params (`?sort=bogus`, `?minPrice=abc`) are coerced/dropped by
  `validateSearch` to safe defaults — never throw.
- Empty result set → existing empty state.
- Price bounds derive from the loaded set; if all products in the set share a
  single price (`min === max`), the price control is hidden.
- Changing category re-runs the loader; search/sort/price persist in the URL and
  re-apply to the new set.

## Testing

- **Vitest unit tests** for `filterAndSortProducts` and `getPriceBounds`:
  search match (title/description/tags, case-insensitivity, empty query), price
  range inclusivity, and each sort key (including undefined-rating ordering).
- **Playwright e2e** (optional, mirrors existing flow test): type a query →
  grid narrows; change sort → order changes; set a price range → grid narrows;
  verify the URL reflects state and a reload restores it.

## Out of scope

- In-stock-only toggle (deliberately excluded).
- Server-side filtering / faceted (tag) filters.
- Search across variants or full-text relevance ranking (simple substring only).
