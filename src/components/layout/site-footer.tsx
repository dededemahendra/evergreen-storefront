import { Link } from "@tanstack/react-router"
import { Leaf } from "lucide-react"
import { siteConfig } from "@/config/site"

const categories = [
  { label: "Apparel", category: "apparel" },
  { label: "Outdoor", category: "outdoor" },
  { label: "Home", category: "home" },
  { label: "Accessories", category: "accessories" },
] as const

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <p className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Leaf className="size-5 text-primary" />
            {siteConfig.name}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Shop</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-foreground">
                All products
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.category}>
                <Link
                  to="/products"
                  search={{ category: c.category }}
                  className="hover:text-foreground"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Help</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/cart" className="hover:text-foreground">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="hover:text-foreground">
                Checkout
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Stay in the loop</p>
          <p className="text-sm text-muted-foreground">
            New drops, restocks, and field notes — no spam.
          </p>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  )
}
