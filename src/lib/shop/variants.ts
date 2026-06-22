import type { Product, ProductVariant } from "./types"

/** The first variant is treated as the default purchasable unit. */
export function getDefaultVariant(product: Product): ProductVariant {
  return product.variants[0]
}

/** Find the variant matching a full option selection (e.g. { Size: "M" }). */
export function findVariant(
  product: Product,
  selection: Record<string, string>
): ProductVariant | undefined {
  return product.variants.find((variant) =>
    Object.entries(selection).every(
      ([name, value]) => variant.options[name] === value
    )
  )
}

export function getPriceRange(product: Product): { min: number; max: number } {
  const prices = product.variants.map((v) => v.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function isInStock(product: Product): boolean {
  return product.variants.some((v) => v.inventory > 0)
}
