import { createFileRoute, Link } from "@tanstack/react-router"
import { ProductGrid } from "@/components/product/product-grid"
import { getCategories, getProducts } from "@/lib/shop/data"
import { cn } from "@/lib/utils"

type ProductSearch = { category?: string }

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    category:
      typeof search.category === "string" ? search.category : undefined,
  }),
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
  const { category } = Route.useSearch()

  const activeCategory = categories.find((c) => c.slug === category)

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

      {/* Category filter */}
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
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>
      <ProductGrid products={products} />
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
      search={to ? { category: to } : {}}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  )
}
