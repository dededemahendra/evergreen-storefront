import { createFileRoute, Link } from "@tanstack/react-router"
import { ShoppingBag, Trash2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { QuantityStepper } from "@/components/cart/quantity-stepper"
import {
  lineKey,
  useCartActions,
  useCartHydrated,
  useCartItems,
  useCartTotals,
} from "@/lib/cart/store"
import { imageOrPlaceholder } from "@/lib/shop/images"
import { formatPrice } from "@/lib/shop/pricing"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/cart")({
  component: CartPage,
})

function CartPage() {
  const hydrated = useCartHydrated()
  const items = useCartItems()
  const totals = useCartTotals()
  const { updateQuantity, removeItem, clear } = useCartActions()

  if (!hydrated) return <CartSkeleton />
  if (items.length === 0) return <EmptyCart />

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 font-heading text-3xl font-semibold">Your cart</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <ul className="divide-y border-y">
            {items.map((item) => (
              <li key={lineKey(item)} className="flex gap-4 py-5">
                <Link
                  to="/products/$slug"
                  params={{ slug: item.productSlug }}
                  className="size-24 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={imageOrPlaceholder(item.image)}
                    alt={item.title}
                    className="size-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        to="/products/$slug"
                        params={{ slug: item.productSlug }}
                        className="font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                      {item.variantTitle !== "Default" ? (
                        <p className="text-sm text-muted-foreground">
                          {item.variantTitle}
                        </p>
                      ) : null}
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => updateQuantity(lineKey(item), q)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(lineKey(item))}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between">
            <Link
              to="/products"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Continue shopping
            </Link>
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear cart
            </Button>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border p-6">
          <h2 className="font-medium">Order summary</h2>
          {totals.amountToFreeShipping > 0 ? (
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              Add {formatPrice(totals.amountToFreeShipping)} more to unlock free
              shipping.
            </p>
          ) : null}
          <div className="space-y-2 text-sm">
            <SummaryRow label="Subtotal" value={formatPrice(totals.subtotal)} />
            <SummaryRow
              label="Shipping"
              value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
            />
            <SummaryRow label="Tax" value={formatPrice(totals.tax)} />
            <Separator />
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-24 text-center">
      <ShoppingBag className="size-12 text-muted-foreground/40" />
      <h1 className="font-heading text-2xl font-semibold">Your cart is empty</h1>
      <p className="max-w-sm text-muted-foreground">
        Looks like you haven't added anything yet. Let's fix that.
      </p>
      <Link to="/products" className={cn(buttonVariants(), "mt-2")}>
        Start shopping
      </Link>
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Skeleton className="mb-8 h-9 w-40" />
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}
