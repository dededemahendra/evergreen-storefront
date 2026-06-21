import { useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { ChevronRight, RotateCcw, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AddToCartForm } from "@/components/product/add-to-cart-form"
import { StarRating } from "@/components/product/star-rating"
import { getProduct } from "@/lib/shop/data"
import { imageOrPlaceholder } from "@/lib/shop/images"
import { formatPrice } from "@/lib/shop/pricing"
import { getPriceRange } from "@/lib/shop/variants"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const product = await getProduct({ data: params.slug })
    if (!product) throw notFound()
    return { product }
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.product.title} — Evergreen` },
            { name: "description", content: loaderData.product.description },
          ],
        }
      : {},
  component: ProductPage,
})

/** Keyed per product so `activeImage` resets when navigating between products. */
function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [activeImage, setActiveImage] = useState(0)

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/10">
        <img
          src={imageOrPlaceholder(images[activeImage])}
          alt={title}
          className="size-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-3">
          {images.map((image, i) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(i)}
              className={cn(
                "size-20 overflow-hidden rounded-lg ring-1 transition",
                i === activeImage
                  ? "ring-2 ring-primary"
                  : "ring-foreground/10 hover:ring-foreground/30",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={imageOrPlaceholder(image)}
                alt=""
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ProductPage() {
  const { product } = Route.useLoaderData()
  const { min, max } = getPriceRange(product)
  const onSale = product.compareAtPrice != null && product.compareAtPrice > min

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.categorySlug ? (
          <>
            <ChevronRight className="size-4" />
            <Link
              to="/products"
              search={{ category: product.categorySlug }}
              className="hover:text-foreground"
            >
              {product.categoryTitle}
            </Link>
          </>
        ) : null}
        <ChevronRight className="size-4" />
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          key={product.id}
          images={product.images}
          title={product.title}
        />

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.categoryTitle ? (
              <p className="text-sm text-muted-foreground">
                {product.categoryTitle}
              </p>
            ) : null}
            <h1 className="font-heading text-3xl font-semibold">
              {product.title}
            </h1>
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">
              {min === max ? formatPrice(min) : `From ${formatPrice(min)}`}
            </span>
            {onSale ? (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <Badge variant="destructive">Sale</Badge>
              </>
            ) : null}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <Separator />

          <AddToCartForm key={product.id} product={product} />

          <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              Free shipping over $75
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="size-4 text-primary" />
              30-day easy returns
            </div>
          </div>

          {product.details ? (
            <div className="space-y-2">
              <h2 className="font-medium">Details</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.details}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
