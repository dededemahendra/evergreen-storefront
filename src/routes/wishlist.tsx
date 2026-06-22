import { createFileRoute, Link } from "@tanstack/react-router"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "@/components/product/product-card"
import { useCartActions } from "@/lib/cart/store"
import { getProducts } from "@/lib/shop/data"
import type { Product } from "@/lib/shop/types"
import { getDefaultVariant } from "@/lib/shop/variants"
import { useWishlistHydrated, useWishlistIds } from "@/lib/wishlist/store"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/wishlist")({
  // Load the full catalog once; the wishlist filters to saved ids client-side.
  loader: async () => ({ products: await getProducts({ data: {} }) }),
  component: WishlistPage,
})

function WishlistPage() {
  const { products } = Route.useLoaderData()
  const hydrated = useWishlistHydrated()
  const ids = useWishlistIds()
  const saved = products.filter((p) => ids.includes(p.id))

  if (!hydrated) return <WishlistSkeleton />
  if (saved.length === 0) return <EmptyWishlist />

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 font-heading text-3xl font-semibold">
        Your wishlist
      </h1>
      <p className="mb-8 text-muted-foreground">
        {saved.length} {saved.length === 1 ? "item" : "items"} saved
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {saved.map((product) => (
          <div key={product.id} className="space-y-2">
            <ProductCard product={product} />
            <WishlistAddToCart product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}

function WishlistAddToCart({ product }: { product: Product }) {
  const { addItem } = useCartActions()

  if (product.options.length > 0) {
    return (
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "w-full"
        )}
      >
        Choose options
      </Link>
    )
  }

  const variant = getDefaultVariant(product)
  const inStock = variant.inventory > 0

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      disabled={!inStock}
      onClick={() => {
        addItem(
          {
            productId: product.id,
            productSlug: product.slug,
            variantId: variant.id,
            title: product.title,
            variantTitle: variant.title,
            price: variant.price,
            image: product.images[0],
          },
          1
        )
        toast.success(`Added ${product.title} to your cart`)
      }}
    >
      {inStock ? "Add to cart" : "Out of stock"}
    </Button>
  )
}

function EmptyWishlist() {
  return (
    <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-24 text-center">
      <Heart className="size-12 text-muted-foreground/40" />
      <h1 className="font-heading text-2xl font-semibold">
        Your wishlist is empty
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Tap the heart on any product to save it here for later.
      </p>
      <Link to="/products" className={cn(buttonVariants(), "mt-2")}>
        Browse products
      </Link>
    </div>
  )
}

function WishlistSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="mb-8 h-4 w-24" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
