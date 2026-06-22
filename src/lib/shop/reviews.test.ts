import { describe, expect, it } from "vitest"
import { generateReviews, reviewSummary } from "./reviews"
import type { Product } from "./types"

function product(rating?: number, reviewCount?: number): Product {
  return {
    id: "p-test",
    slug: "test",
    title: "Test",
    description: "",
    price: 10,
    currency: "USD",
    images: [],
    tags: [],
    featured: false,
    rating,
    reviewCount,
    options: [],
    variants: [
      { id: "v", title: "Default", options: {}, price: 10, inventory: 1 },
    ],
  }
}

describe("reviewSummary", () => {
  it("breakdown sums exactly to the total", () => {
    const s = reviewSummary(product(4.8, 137))
    expect(s.breakdown.reduce((a, b) => a + b.count, 0)).toBe(137)
    expect(s.breakdown.map((b) => b.stars)).toEqual([5, 4, 3, 2, 1])
    // highest rating dominates
    expect(s.breakdown[0].count).toBeGreaterThan(s.breakdown[4].count)
  })

  it("returns all-zero breakdown when there are no reviews", () => {
    const s = reviewSummary(product(0, 0))
    expect(s.total).toBe(0)
    expect(s.breakdown.every((b) => b.count === 0)).toBe(true)
  })
})

describe("generateReviews", () => {
  it("is deterministic for the same product", () => {
    expect(generateReviews(product(4.5, 50))).toEqual(
      generateReviews(product(4.5, 50))
    )
  })

  it("caps at the max and yields valid ratings", () => {
    const reviews = generateReviews(product(4.5, 50), 8)
    expect(reviews).toHaveLength(8)
    expect(reviews.every((r) => r.rating >= 1 && r.rating <= 5)).toBe(true)
  })

  it("returns nothing when there are no reviews", () => {
    expect(generateReviews(product(0, 0))).toEqual([])
  })
})
