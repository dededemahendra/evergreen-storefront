import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import type { AnyFieldApi } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  lineKey,
  useCartActions,
  useCartHydrated,
  useCartItems,
} from "@/lib/cart/store"
import { validateDiscountCode } from "@/lib/discounts/client"
import { placeOrder } from "@/lib/orders/client"
import { imageOrPlaceholder } from "@/lib/shop/images"
import { computeTotals, formatPrice } from "@/lib/shop/pricing"
import { checkoutCustomerSchema } from "@/lib/shop/types"
import type { Discount } from "@/lib/shop/types"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
})

// Form-specific schema: `phone` is a plain string here (the field always holds
// at least ""), while the order schema keeps it optional. This keeps the form
// value type and the validator input type aligned for TanStack Form.
const checkoutFormSchema = checkoutCustomerSchema.extend({ phone: z.string() })

function isInvalid(field: AnyFieldApi) {
  return field.state.meta.isTouched && field.state.meta.errors.length > 0
}

function FieldError({ field }: { field: AnyFieldApi }) {
  if (!isInvalid(field)) return null
  const messages = field.state.meta.errors
    .map((e: unknown) =>
      typeof e === "string" ? e : (e as { message?: string }).message
    )
    .filter(Boolean)
  if (messages.length === 0) return null
  return (
    <p
      id={`${field.name}-error`}
      role="alert"
      className="text-xs text-destructive"
    >
      {messages.join(", ")}
    </p>
  )
}

/** Renders a labeled text input wired up to a TanStack Form field, with
 *  accessible error association. Called inline within a Field render-prop, so it
 *  does not introduce a remounting component boundary. */
function renderField(
  field: AnyFieldApi,
  label: string,
  inputProps: React.ComponentProps<typeof Input> = {}
) {
  const invalid = isInvalid(field)
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${field.name}-error` : undefined}
        {...inputProps}
      />
      <FieldError field={field} />
    </div>
  )
}

function CheckoutPage() {
  const hydrated = useCartHydrated()
  const items = useCartItems()
  const { clear } = useCartActions()
  const navigate = useNavigate()

  const [discount, setDiscount] = useState<Discount | null>(null)
  const [codeInput, setCodeInput] = useState("")
  const [applyingCode, setApplyingCode] = useState(false)
  const totals = computeTotals(items, { discount: discount ?? undefined })

  async function applyCode() {
    const code = codeInput.trim()
    if (!code) return
    setApplyingCode(true)
    try {
      const applied = await validateDiscountCode(code, totals.subtotal)
      setDiscount(applied)
      setCodeInput("")
      toast.success(`Applied ${applied.label}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "That code isn't valid."
      )
    } finally {
      setApplyingCode(false)
    }
  }

  const form = useForm({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      phone: "",
    },
    validators: { onChange: checkoutFormSchema },
    onSubmit: async ({ value }) => {
      try {
        const order = await placeOrder({
          items,
          customer: value,
          discountCode: discount?.code,
        })
        // Navigate first, then clear, so the cart-empty state never flashes.
        await navigate({
          to: "/orders/$orderId",
          params: { orderId: order.id },
        })
        clear()
        toast.success("Order placed — thank you!")
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "We couldn't place your order. Please try again."
        )
      }
    },
  })

  if (!hydrated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-9 w-40" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Your cart is empty
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Add a few things before heading to checkout.
        </p>
        <Link to="/products" className={cn(buttonVariants(), "mt-2")}>
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 font-heading text-3xl font-semibold">Checkout</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="grid gap-10 lg:grid-cols-[1fr_380px]"
      >
        {/* Customer details */}
        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="font-medium">Contact</h2>
            <form.Field name="email">
              {(field) =>
                renderField(field, "Email", {
                  type: "email",
                  autoComplete: "email",
                  placeholder: "you@example.com",
                })
              }
            </form.Field>
          </section>

          <section className="space-y-4">
            <h2 className="font-medium">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="firstName">
                {(field) =>
                  renderField(field, "First name", {
                    autoComplete: "given-name",
                  })
                }
              </form.Field>
              <form.Field name="lastName">
                {(field) =>
                  renderField(field, "Last name", {
                    autoComplete: "family-name",
                  })
                }
              </form.Field>
            </div>

            <form.Field name="address">
              {(field) =>
                renderField(field, "Address", {
                  autoComplete: "street-address",
                })
              }
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="city">
                {(field) =>
                  renderField(field, "City", { autoComplete: "address-level2" })
                }
              </form.Field>
              <form.Field name="state">
                {(field) =>
                  renderField(field, "State / Province", {
                    autoComplete: "address-level1",
                  })
                }
              </form.Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="postalCode">
                {(field) =>
                  renderField(field, "Postal code", {
                    autoComplete: "postal-code",
                  })
                }
              </form.Field>
              <form.Field name="country">
                {(field) =>
                  renderField(field, "Country", {
                    autoComplete: "country-name",
                  })
                }
              </form.Field>
            </div>

            <form.Field name="phone">
              {(field) =>
                renderField(field, "Phone (optional)", {
                  type: "tel",
                  autoComplete: "tel",
                })
              }
            </form.Field>
          </section>

          <p className="text-sm text-muted-foreground">
            This is a demo checkout — no real payment is processed. The order is
            recorded by the Hono API and you'll be taken to a confirmation page.
          </p>
        </div>

        {/* Order summary */}
        <aside className="h-fit space-y-4 rounded-xl border p-6">
          <h2 className="font-medium">Order summary</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={lineKey(item)} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={imageOrPlaceholder(item.image)}
                    alt={item.title}
                    className="size-full object-cover"
                  />
                  <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="leading-tight font-medium">{item.title}</p>
                  {item.variantTitle !== "Default" ? (
                    <p className="text-xs text-muted-foreground">
                      {item.variantTitle}
                    </p>
                  ) : null}
                </div>
                <span className="text-sm">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <Separator />

          {discount ? (
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{discount.code}</span> ·{" "}
                {discount.label}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setDiscount(null)}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void applyCode()
                  }
                }}
                placeholder="Promo code"
                aria-label="Promo code"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void applyCode()}
                disabled={applyingCode || codeInput.trim() === ""}
              >
                Apply
              </Button>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 ? (
              <div className="flex justify-between text-primary">
                <span>Discount{discount ? ` (${discount.code})` : ""}</span>
                <span>−{formatPrice(totals.discountAmount)}</span>
              </div>
            ) : null}
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
            <Separator />
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>

          <form.Subscribe selector={(s) => [s.isSubmitting] as const}>
            {([isSubmitting]) => (
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Placing order…"
                  : `Pay ${formatPrice(totals.total)}`}
              </Button>
            )}
          </form.Subscribe>

          <Link
            to="/cart"
            className="block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to cart
          </Link>
        </aside>
      </form>
    </div>
  )
}
