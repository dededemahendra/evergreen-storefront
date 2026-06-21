import { Link } from "@tanstack/react-router"
import { ShoppingBag, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { QuantityStepper } from "@/components/cart/quantity-stepper"
import {
  lineKey,
  useCartActions,
  useCartCount,
  useCartHydrated,
  useCartItems,
  useCartTotals,
} from "@/lib/cart/store"
import { imageOrPlaceholder } from "@/lib/shop/images"
import { formatPrice } from "@/lib/shop/pricing"
import { cn } from "@/lib/utils"

export function CartSheet() {
  const items = useCartItems()
  const count = useCartCount()
  const hydrated = useCartHydrated()
  const totals = useCartTotals()
  const { updateQuantity, removeItem } = useCartActions()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Open cart${hydrated && count > 0 ? `, ${count} items` : ""}`}
        >
          <ShoppingBag />
          {hydrated && count > 0 ? (
            <Badge className="absolute -right-1 -top-1 size-4 justify-center rounded-full px-0 text-[10px] tabular-nums">
              {count}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>
            Your cart{hydrated && count > 0 ? ` (${count})` : ""}
          </SheetTitle>
        </SheetHeader>

        {!hydrated ? (
          <div className="flex-1 space-y-4 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <SheetClose asChild>
              <Link
                to="/products"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Browse products
              </Link>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={lineKey(item)} className="flex gap-3 py-3">
                    <img
                      src={imageOrPlaceholder(item.image)}
                      alt={item.title}
                      className="size-16 rounded-md object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {item.title}
                          </p>
                          {item.variantTitle !== "Default" ? (
                            <p className="text-xs text-muted-foreground">
                              {item.variantTitle}
                            </p>
                          ) : null}
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          onChange={(q) => updateQuantity(lineKey(item), q)}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeItem(lineKey(item))}
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-t">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(totals.tax)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>
              <SheetClose asChild>
                <Link
                  to="/checkout"
                  className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
                >
                  Checkout
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  to="/cart"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  View cart
                </Link>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
