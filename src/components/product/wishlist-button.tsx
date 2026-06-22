import { Heart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useIsWishlisted, useWishlistActions } from "@/lib/wishlist/store"
import { cn } from "@/lib/utils"

/**
 * Heart toggle for saving a product to the wishlist. As an overlay it must be a
 * sibling of (not nested in) the product-card Link, so it stops propagation to
 * avoid triggering navigation.
 */
export function WishlistButton({
  productId,
  title,
  withLabel = false,
  className,
}: {
  productId: string
  title: string
  withLabel?: boolean
  className?: string
}) {
  const wishlisted = useIsWishlisted(productId)
  const { toggle } = useWishlistActions()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggle(productId)
    toast.success(
      wishlisted
        ? `Removed ${title} from your wishlist`
        : `Saved ${title} to your wishlist`
    )
  }

  if (withLabel) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        aria-pressed={wishlisted}
        className={className}
      >
        <Heart className={cn(wishlisted && "fill-red-500 text-red-500")} />
        {wishlisted ? "Saved" : "Save"}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={handleClick}
      aria-pressed={wishlisted}
      aria-label={
        wishlisted
          ? `Remove ${title} from wishlist`
          : `Save ${title} to wishlist`
      }
      className={cn(
        "bg-background/80 backdrop-blur hover:bg-background",
        className
      )}
    >
      <Heart
        className={cn("size-4", wishlisted && "fill-red-500 text-red-500")}
      />
    </Button>
  )
}
