import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { useCartActions } from "@/lib/cart/store"
import { colorFor, isColorOption } from "@/lib/shop/colors"
import { formatPrice } from "@/lib/shop/pricing"
import { findVariant, getDefaultVariant } from "@/lib/shop/variants"
import type { Product } from "@/lib/shop/types"
import { cn } from "@/lib/utils"

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCartActions()
  const navigate = useNavigate()
  const hasOptions = product.options.length > 0

  const [selection, setSelection] = useState<Record<string, string>>(() => ({
    ...getDefaultVariant(product).options,
  }))
  const [quantity, setQuantity] = useState(1)

  const variant = hasOptions
    ? findVariant(product, selection)
    : getDefaultVariant(product)
  const allSelected = product.options.every((o) => Boolean(selection[o.name]))
  const inStock = variant ? variant.inventory > 0 : false
  const maxQty = inStock && variant ? variant.inventory : 1

  useEffect(() => {
    setQuantity((q) => Math.min(q, maxQty))
  }, [variant?.id, maxQty])

  function select(name: string, value: string) {
    setSelection((s) => ({ ...s, [name]: value }))
  }

  /** Returns true if the item was added. */
  function addToCart(): boolean {
    if (!variant) {
      toast.error("Please select all options first.")
      return false
    }
    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price,
        image: product.images[0],
        kind: product.kind,
      },
      quantity
    )
    return true
  }

  function handleAdd() {
    if (addToCart()) {
      toast.success(`Added ${product.title} to your cart.`)
      setQuantity(1)
    }
  }

  async function handleBuyNow() {
    if (addToCart()) await navigate({ to: "/checkout" })
  }

  const disabled = !variant || !allSelected || !inStock

  return (
    <div className="space-y-6">
      {product.options.map((option) => {
        const isColor = isColorOption(option.name)
        return (
          <div key={option.name} className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{option.name}</span>
              {selection[option.name] ? (
                <span className="text-muted-foreground">
                  {selection[option.name]}
                </span>
              ) : null}
            </div>
            <div
              role="group"
              aria-label={option.name}
              className="flex flex-wrap gap-2"
            >
              {option.values.map((value) => {
                const selected = selection[option.name] === value
                if (isColor) {
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => select(option.name, value)}
                      aria-label={value}
                      aria-pressed={selected}
                      title={value}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full ring-1 ring-foreground/15 transition",
                        selected &&
                          "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: colorFor(value) }}
                    >
                      {selected ? (
                        <Check className="size-4 text-white mix-blend-difference" />
                      ) : null}
                    </button>
                  )
                }
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => select(option.name, value)}
                    aria-pressed={selected}
                    className={cn(
                      "min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-input hover:border-foreground/40"
                    )}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} max={maxQty} />
        <span className="text-sm text-muted-foreground">
          {variant
            ? inStock
              ? `${variant.inventory} in stock`
              : "Out of stock"
            : "Select options"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="h-11 w-full text-base"
          onClick={handleAdd}
          disabled={disabled}
        >
          {variant && allSelected
            ? `Add to cart · ${formatPrice(variant.price * quantity)}`
            : "Add to cart"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-11 w-full text-base"
          onClick={() => void handleBuyNow()}
          disabled={disabled}
        >
          Buy now
        </Button>
      </div>
    </div>
  )
}
