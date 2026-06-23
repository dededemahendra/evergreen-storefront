import type { CartItem, Product } from "./types"

/** Thrown when a cart line can't be matched against the live catalog. */
export class OrderValidationError extends Error {}

/**
 * Re-resolve client-supplied cart lines against the authoritative catalog,
 * overwriting price/title/variantTitle/kind from the trusted product. The client
 * sends these fields for display, but they must NEVER be trusted for charging or
 * for minting gift cards — otherwise a tampered request could buy for $0 or mint
 * arbitrary gift-card value. Quantity is kept from the (schema-validated) client.
 *
 * Throws `OrderValidationError` if a line references a product or variant that no
 * longer exists in the catalog.
 */
export function resolveOrderItems(
  clientItems: CartItem[],
  catalog: Product[]
): CartItem[] {
  const byId = new Map(catalog.map((p) => [p.id, p]))
  return clientItems.map((item) => {
    const product = byId.get(item.productId)
    const variant = product?.variants.find((v) => v.id === item.variantId)
    if (!product || !variant) {
      throw new OrderValidationError(
        `Item no longer available: ${item.title || item.productId}`
      )
    }
    return {
      ...item,
      productId: product.id,
      productSlug: product.slug,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      image: product.images[0] ?? item.image,
      kind: product.kind,
    }
  })
}
