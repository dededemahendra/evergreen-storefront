import { Link } from "@tanstack/react-router"
import { Heart, Leaf } from "lucide-react"
import { CartSheet } from "@/components/cart/cart-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWishlistCount, useWishlistHydrated } from "@/lib/wishlist/store"
import { siteConfig } from "@/config/site"

const navLinkClass =
  "rounded-md px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"

function WishlistIndicator() {
  const count = useWishlistCount()
  const hydrated = useWishlistHydrated()
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`Wishlist${hydrated && count > 0 ? `, ${count} items` : ""}`}
    >
      <Link to="/wishlist">
        <Heart />
        {hydrated && count > 0 ? (
          <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full px-0 text-[10px] tabular-nums">
            {count}
          </Badge>
        ) : null}
      </Link>
    </Button>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center gap-6 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold"
        >
          <Leaf className="size-5 text-primary" />
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-0.5 text-sm md:flex">
          <Link to="/products" className={navLinkClass}>
            Shop all
          </Link>
          <Link
            to="/products"
            search={{ category: "apparel" }}
            className={navLinkClass}
          >
            Apparel
          </Link>
          <Link
            to="/products"
            search={{ category: "outdoor" }}
            className={navLinkClass}
          >
            Outdoor
          </Link>
          <Link
            to="/products"
            search={{ category: "home" }}
            className={navLinkClass}
          >
            Home
          </Link>
          <Link
            to="/products"
            search={{ category: "accessories" }}
            className={navLinkClass}
          >
            Accessories
          </Link>
        </nav>

        <div className="ml-auto flex items-center">
          <WishlistIndicator />
          <CartSheet />
        </div>
      </div>
    </header>
  )
}
