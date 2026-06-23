import { describe, expect, it } from "vitest"
import { OrderValidationError, resolveOrderItems } from "./order-items"
import type { CartItem, Product } from "./types"

function makeProduct(
  id: string,
  variants: { id: string; price: number; title?: string }[],
  extra: Partial<Product> = {}
): Product {
  return {
    id,
    slug: `${id}-slug`,
    title: `Trusted ${id}`,
    description: "",
    price: variants[0].price,
    currency: "USD",
    images: [`${id}.jpg`],
    tags: [],
    featured: false,
    options: [],
    variants: variants.map((v) => ({
      id: v.id,
      title: v.title ?? "Default",
      options: {},
      price: v.price,
      inventory: 10,
    })),
    ...extra,
  }
}

function cartItem(
  overrides: Partial<CartItem> & { productId: string; variantId: string }
): CartItem {
  return {
    productSlug: "client-slug",
    title: "Client Title",
    variantTitle: "Client Variant",
    price: 0,
    quantity: 1,
    ...overrides,
  }
}

const catalog = [
  makeProduct("p1", [{ id: "v1", price: 50, title: "Medium" }]),
  makeProduct("gc", [{ id: "g1", price: 25 }], { kind: "gift_card" }),
]

describe("resolveOrderItems", () => {
  it("overwrites a tampered price with the catalog price", () => {
    const [item] = resolveOrderItems(
      [cartItem({ productId: "p1", variantId: "v1", price: 1 })],
      catalog
    )
    expect(item.price).toBe(50)
    expect(item.title).toBe("Trusted p1")
    expect(item.variantTitle).toBe("Medium")
    expect(item.productSlug).toBe("p1-slug")
  })

  it("enforces kind from the catalog so gift-card value can't be forged", () => {
    const [item] = resolveOrderItems(
      [
        cartItem({
          productId: "gc",
          variantId: "g1",
          kind: undefined,
          price: 9999,
        }),
      ],
      catalog
    )
    expect(item.kind).toBe("gift_card")
    expect(item.price).toBe(25)
  })

  it("preserves the client quantity", () => {
    const [item] = resolveOrderItems(
      [cartItem({ productId: "p1", variantId: "v1", quantity: 3 })],
      catalog
    )
    expect(item.quantity).toBe(3)
  })

  it("throws for an unknown product", () => {
    expect(() =>
      resolveOrderItems(
        [cartItem({ productId: "ghost", variantId: "v1" })],
        catalog
      )
    ).toThrow(OrderValidationError)
  })

  it("throws for an unknown variant", () => {
    expect(() =>
      resolveOrderItems(
        [cartItem({ productId: "p1", variantId: "ghost" })],
        catalog
      )
    ).toThrow(OrderValidationError)
  })
})
