import { describe, expect, it } from "vitest"
import { mapSanityCategory, mapSanityProduct } from "./queries"

const rawProduct = {
  id: "p1",
  slug: "thing",
  title: "Thing",
  description: "A thing",
  details: "More about the thing",
  price: 50,
  compareAtPrice: null,
  currency: "USD",
  images: ["https://example.com/a.jpg", null], // null should be filtered out
  categorySlug: "home",
  categoryTitle: "Home",
  tags: ["a"],
  featured: true,
  rating: 4.5,
  reviewCount: 10,
  kind: "gift_card",
  options: [{ name: "Amount", values: ["$25", "$50"] }],
  variants: [
    {
      id: "v1",
      title: "$25",
      price: 25,
      sku: "V1",
      inventory: 5,
      options: [{ name: "Amount", value: "$25" }],
    },
  ],
}

describe("mapSanityProduct", () => {
  it("maps a Sanity doc into the storefront Product shape", () => {
    const p = mapSanityProduct(rawProduct)
    expect(p.kind).toBe("gift_card")
    expect(p.images).toEqual(["https://example.com/a.jpg"]) // null dropped
    expect(p.compareAtPrice).toBeUndefined() // null -> undefined
    expect(p.categorySlug).toBe("home")
    // variant option array -> record
    expect(p.variants[0].options).toEqual({ Amount: "$25" })
  })

  it("defaults kind to undefined (standard) when absent", () => {
    const { kind, ...withoutKind } = rawProduct
    void kind
    const p = mapSanityProduct(withoutKind)
    expect(p.kind).toBeUndefined()
  })
})

describe("mapSanityCategory", () => {
  it("validates a category doc", () => {
    const c = mapSanityCategory({
      id: "c1",
      slug: "home",
      title: "Home",
      description: "Quiet things",
    })
    expect(c).toMatchObject({ id: "c1", slug: "home", title: "Home" })
  })
})
