import { createFileRoute, Link } from "@tanstack/react-router"
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

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-8 space-y-1">
        <h1 className="font-heading text-3xl font-semibold">
          {activeCategory ? activeCategory.title : "All products"}
        </h1>
        <p className="text-muted-foreground">
          {activeCategory?.description ??
            "Durable, beautifully designed essentials for everyday life."}
        </p>
      </header>

      <CatalogToolbar
        q={q ?? ""}
        sort={sort ?? DEFAULT_SORT}
        bounds={bounds}
        minPrice={minPrice ?? bounds.min}
        maxPrice={maxPrice ?? bounds.max}
        onChange={applyControls}
      />

      {/* Category filter (preserves search + sort, resets price for the new set) */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterPill to={undefined} active={!category}>
          All
        </FilterPill>
        {categories.map((c) => (
          <FilterPill key={c.id} to={c.slug} active={category === c.slug}>
            {c.title}
          </FilterPill>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>
      <ProductGrid products={filtered} />
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
