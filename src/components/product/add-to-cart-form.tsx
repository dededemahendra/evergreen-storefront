import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { useCartActions } from "@/lib/cart/store"
import { formatPrice } from "@/lib/shop/pricing"
import { findVariant, getDefaultVariant } from "@/lib/shop/variants"
import type { Product } from "@/lib/shop/types"

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCartActions()
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

  // Clamp the chosen quantity to the selected variant's available stock.
  useEffect(() => {
    setQuantity((q) => Math.min(q, maxQty))
  }, [variant?.id, maxQty])

  function handleAdd() {
    if (!variant) {
      toast.error("Please select all options first.")
      return
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
      },
      quantity
    )
    toast.success(`Added ${product.title} to your cart.`)
    setQuantity(1)
  }

  return (
    <div className="space-y-5">
      {product.options.map((option) => (
        <div key={option.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{option.name}</span>
            <span className="text-sm text-muted-foreground">
              {selection[option.name]}
            </span>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            aria-label={option.name}
            value={selection[option.name] ?? ""}
            onValueChange={(value) => {
              if (value) setSelection((s) => ({ ...s, [option.name]: value }))
            }}
            className="flex-wrap"
          >
            {option.values.map((value) => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="min-w-11 px-3"
              >
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ))}

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

      <Button
        size="lg"
        className="h-11 w-full text-base"
        onClick={handleAdd}
        disabled={!variant || !allSelected || !inStock}
      >
        {variant && allSelected
          ? `Add to cart · ${formatPrice(variant.price * quantity)}`
          : "Add to cart"}
      </Button>
    </div>
  )
}
