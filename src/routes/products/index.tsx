import { createFileRoute, Link } from "@tanstack/react-router"
import { PackageSearch, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CatalogToolbar } from "@/components/product/catalog-toolbar"
import type { CatalogToolbarChange } from "@/components/product/catalog-toolbar"
import { ProductGrid } from "@/components/product/product-grid"
import {
  DEFAULT_SORT,
  filterAndSortProducts,
  getPriceBounds,
  isProductSort,
} from "@/lib/shop/catalog"
import type { ProductSort } from "@/lib/shop/catalog"
import { getCategories, getProducts } from "@/lib/shop/data"
import { formatPrice } from "@/lib/shop/pricing"
import { cn } from "@/lib/utils"

type ProductSearch = {
  category?: string
  q?: string
  sort?: ProductSort
  minPrice?: number
  maxPrice?: number
}

function toPositiveNumber(value: unknown): number | undefined {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    q:
      typeof search.q === "string" && search.q.trim() !== ""
        ? search.q
        : undefined,
    sort: isProductSort(search.sort) ? search.sort : undefined,
    minPrice: toPositiveNumber(search.minPrice),
    maxPrice: toPositiveNumber(search.maxPrice),
  }),
  // Only `category` drives the loader; search/sort/price filter client-side.
  loaderDeps: ({ search: { category } }) => ({ category }),
  loader: async ({ deps: { category } }) => {
    const [products, categories] = await Promise.all([
      getProducts({ data: { category } }),
      getCategories(),
    ])
    return { products, categories }
  },
  component: ProductsPage,
})

function ProductsPage() {
  const { products, categories } = Route.useLoaderData()
  const { category, q, sort, minPrice, maxPrice } = Route.useSearch()
  const navigate = Route.useNavigate()

  const bounds = getPriceBounds(products)
  const filtered = filterAndSortProducts(products, {
    q,
    sort,
    minPrice,
    maxPrice,
  })
  const activeCategory = categories.find((c) => c.slug === category)

  const searchActive = Boolean(q?.trim())
  const priceActive =
    (minPrice ?? bounds.min) > bounds.min ||
    (maxPrice ?? bounds.max) < bounds.max
  const anyFilter = searchActive || priceActive

  function applyControls(partial: CatalogToolbarChange) {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...partial }
        if (!next.q || next.q.trim() === "") delete next.q
        if (!next.sort || next.sort === DEFAULT_SORT) delete next.sort
        if (next.minPrice == null || next.minPrice <= bounds.min)
          delete next.minPrice
        if (next.maxPrice == null || next.maxPrice >= bounds.max)
          delete next.maxPrice
        return next
      },
      replace: true,
      resetScroll: false,
    })
  }

  function clearFilters() {
    // Keep the chosen category; drop search, sort, and price.
    navigate({
      search: (prev) => ({ category: prev.category }),
      replace: true,
      resetScroll: false,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <header className="mb-6 space-y-1">
        <h1 className="font-heading text-3xl font-semibold">
          {activeCategory ? activeCategory.title : "All products"}
        </h1>
        <p className="text-muted-foreground">
          {activeCategory?.description ??
            "Durable, beautifully designed essentials for everyday life."}
        </p>
      </header>

      {/* Sticky filter bar — search/sort/price + category pills */}
      <div className="sticky top-14 z-30 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-24">
        <CatalogToolbar
          q={q ?? ""}
          sort={sort ?? DEFAULT_SORT}
          bounds={bounds}
          minPrice={minPrice ?? bounds.min}
          maxPrice={maxPrice ?? bounds.max}
          onChange={applyControls}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterPill to={undefined} active={!category}>
            All
          </FilterPill>
          {categories.map((c) => (
            <FilterPill key={c.id} to={c.slug} active={category === c.slug}>
              {c.title}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Result count + active-filter chips */}
      <div className="mt-6 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>
        {anyFilter ? (
          <div className="flex flex-wrap items-center gap-2">
            {searchActive ? (
              <FilterChip onRemove={() => applyControls({ q: "" })}>
                “{q}”
              </FilterChip>
            ) : null}
            {priceActive ? (
              <FilterChip
                onRemove={() =>
                  applyControls({ minPrice: bounds.min, maxPrice: bounds.max })
                }
              >
                {formatPrice(minPrice ?? bounds.min)} –{" "}
                {formatPrice(maxPrice ?? bounds.max)}
              </FilterChip>
            ) : null}
            <Button
              variant="ghost"
              size="xs"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState onClear={anyFilter ? clearFilters : undefined} />
      ) : (
        <ProductGrid products={filtered} />
      )}
    </div>
  )
}

function FilterChip({
  children,
  onRemove,
}: {
  children: React.ReactNode
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 py-1 pr-1 pl-3 text-xs">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove filter"
        className="rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <PackageSearch className="size-12 text-muted-foreground/40" />
      <h2 className="font-heading text-xl font-semibold">No products match</h2>
      <p className="max-w-sm text-muted-foreground">
        Try a different search or adjust your filters.
      </p>
      {onClear ? (
        <Button variant="outline" onClick={onClear} className="mt-1">
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}

function FilterPill({
  to,
  active,
  children,
}: {
  to: string | undefined
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to="/products"
      search={(prev) => ({
        ...prev,
        category: to,
        minPrice: undefined,
        maxPrice: undefined,
      })}
      resetScroll={false}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  )
}
