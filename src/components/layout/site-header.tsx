import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { Heart, Leaf, Search } from "lucide-react"
import { CartSheet } from "@/components/cart/cart-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWishlistCount, useWishlistHydrated } from "@/lib/wishlist/store"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

const navLinkClass =
  "rounded-md px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"

const categories = [
  { label: "Apparel", category: "apparel" },
  { label: "Outdoor", category: "outdoor" },
  { label: "Home", category: "home" },
  { label: "Accessories", category: "accessories" },
] as const

function HeaderSearch({ className }: { className?: string }) {
  const [q, setQ] = useState("")
  const navigate = useNavigate()
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const value = q.trim()
        void navigate({
          to: "/products",
          search: value ? { q: value } : {},
        })
      }}
      className={cn("relative", className)}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="h-9 pl-9"
      />
    </form>
  )
}

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
      {/* Top row: logo · search · actions */}
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-heading text-lg font-semibold"
        >
          <Leaf className="size-5 text-primary" />
          {siteConfig.name}
        </Link>

        <HeaderSearch className="mx-auto hidden w-full max-w-xl flex-1 md:block" />

        <div className="ml-auto flex items-center md:ml-0">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Search products"
          >
            <Link to="/products">
              <Search />
            </Link>
          </Button>
          <WishlistIndicator />
          <CartSheet />
        </div>
      </div>

      {/* Category nav row */}
      <nav className="hidden border-t md:block">
        <div className="container mx-auto flex h-10 items-center gap-0.5 px-4 text-sm">
          <Link to="/products" className={navLinkClass}>
            Shop all
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              to="/products"
              search={{ category: c.category }}
              className={navLinkClass}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
