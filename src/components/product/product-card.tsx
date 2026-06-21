import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/shop/pricing"
import { imageOrPlaceholder } from "@/lib/shop/images"
import { getPriceRange } from "@/lib/shop/variants"
import type { Product } from "@/lib/shop/types"
import { StarRating } from "./star-rating"

export function ProductCard({ product }: { product: Product }) {
  const { min, max } = getPriceRange(product)
  const onSale = product.compareAtPrice != null && product.compareAtPrice > min

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group/card block overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageOrPlaceholder(product.images[0])}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover/card:scale-105"
        />
        {onSale ? (
          <Badge variant="destructive" className="absolute left-2 top-2">
            Sale
          </Badge>
        ) : product.featured ? (
          <Badge className="absolute left-2 top-2">Featured</Badge>
        ) : null}
      </div>

      <div className="space-y-1 p-3">
        {product.categoryTitle ? (
          <p className="text-xs text-muted-foreground">{product.categoryTitle}</p>
        ) : null}
        <h3 className="line-clamp-1 font-medium leading-snug">{product.title}</h3>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <p className="flex items-baseline gap-2 pt-1 text-sm">
          <span className="font-medium">
            {min === max ? formatPrice(min) : `From ${formatPrice(min)}`}
          </span>
          {onSale ? (
            <span className="text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  )
}
