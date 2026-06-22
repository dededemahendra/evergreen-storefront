import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import type { Product } from "@/lib/shop/types"
import { ProductCard } from "./product-card"

export function ProductRow({
  title,
  products,
  viewAllSearch,
}: {
  title: string
  products: Product[]
  /** When set, shows a "View all" link to /products with these search params. */
  viewAllSearch?: { category?: string }
}) {
  if (products.length === 0) return null

  return (
    <section className="border-t pt-10">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-heading text-2xl font-semibold">{title}</h2>
        {viewAllSearch ? (
          <Link
            to="/products"
            search={viewAllSearch}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
