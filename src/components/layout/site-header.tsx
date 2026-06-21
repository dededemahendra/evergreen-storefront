import { Link } from "@tanstack/react-router"
import { Leaf } from "lucide-react"
import { CartSheet } from "@/components/cart/cart-sheet"
import { siteConfig } from "@/config/site"

const navLinkClass =
  "rounded-md px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"

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
          <CartSheet />
        </div>
      </div>
    </header>
  )
}
