import { describe, expect, it } from "vitest"
import { filterAndSortProducts, getPriceBounds, isProductSort } from "./catalog"
import type { Product } from "./types"

function makeProduct(
  o: Partial<Product> & { title: string; price: number }
): Product {
  return {
    id: o.id ?? o.title,
    slug: o.slug ?? o.title.toLowerCase().replace(/\s+/g, "-"),
    title: o.title,
    description: o.description ?? "",
    details: o.details,
    price: o.price,
    compareAtPrice: o.compareAtPrice,
    currency: o.currency ?? "USD",
    images: o.images ?? [],
    categorySlug: o.categorySlug,
    categoryTitle: o.categoryTitle,
    tags: o.tags ?? [],
    featured: o.featured ?? false,
    rating: o.rating,
    reviewCount: o.reviewCount,
    options: o.options ?? [],
    variants: o.variants ?? [
      {
        id: `${o.title}-v`,
        title: "Default",
        options: {},
        price: o.price,
        inventory: 10,
      },
    ],
  }
}

const jacket = makeProduct({
  title: "Alpine Jacket",
  price: 189,
  description: "A weatherproof shell",
  tags: ["waterproof"],
  featured: true,
  rating: 4.8,
})
const tee = makeProduct({
  title: "Merino Tee",
  price: 68,
  tags: ["merino"],
  featured: true,
  rating: 4.6,
})
const mug = makeProduct({
  title: "Camp Mug",
  price: 28,
  tags: ["ceramic"],
  featured: false,
  rating: 4.7,
})
const bottle = makeProduct({
  title: "Water Bottle",
  price: 34,
  featured: false,
  rating: undefined,
})

const all = [jacket, tee, mug, bottle]
const titles = (products: Product[]) => products.map((p) => p.title)

describe("getPriceBounds", () => {
  it("returns {0,0} for an empty set", () => {
    expect(getPriceBounds([])).toEqual({ min: 0, max: 0 })
  })

  it("returns floor(min) / ceil(max) across the set", () => {
    expect(getPriceBounds(all)).toEqual({ min: 28, max: 189 })
  })
})

describe("isProductSort", () => {
  it("accepts valid sorts and rejects others", () => {
    expect(isProductSort("price-asc")).toBe(true)
    expect(isProductSort("bogus")).toBe(false)
    expect(isProductSort(undefined)).toBe(false)
  })
})

describe("filterAndSortProducts — search", () => {
  it("returns everything (featured order) when query is empty", () => {
    expect(titles(filterAndSortProducts(all, {}))).toEqual([
      "Alpine Jacket",
      "Merino Tee",
      "Camp Mug",
      "Water Bottle",
    ])
  })

  it("matches the title", () => {
    expect(titles(filterAndSortProducts(all, { q: "merino" }))).toEqual([
      "Merino Tee",
    ])
  })

  it("matches the description", () => {
    expect(titles(filterAndSortProducts(all, { q: "shell" }))).toEqual([
      "Alpine Jacket",
    ])
  })

  it("matches tags and is case-insensitive", () => {
    expect(titles(filterAndSortProducts(all, { q: "WATERPROOF" }))).toEqual([
      "Alpine Jacket",
    ])
  })

  it("requires all terms to match (AND)", () => {
    expect(titles(filterAndSortProducts(all, { q: "merino tee" }))).toEqual([
      "Merino Tee",
    ])
    expect(filterAndSortProducts(all, { q: "merino jacket" })).toEqual([])
  })

  it("returns nothing when no product matches", () => {
    expect(filterAndSortProducts(all, { q: "nonexistent" })).toEqual([])
  })
})

describe("filterAndSortProducts — price filter", () => {
  it("filters by minPrice (inclusive)", () => {
    expect(
      titles(filterAndSortProducts(all, { minPrice: 68, sort: "name" }))
    ).toEqual(["Alpine Jacket", "Merino Tee"])
  })

  it("filters by maxPrice (inclusive)", () => {
    expect(
      titles(filterAndSortProducts(all, { maxPrice: 34, sort: "name" }))
    ).toEqual(["Camp Mug", "Water Bottle"])
  })

  it("filters by a min/max range", () => {
    expect(
      titles(
        filterAndSortProducts(all, { minPrice: 30, maxPrice: 70, sort: "name" })
      )
    ).toEqual(["Merino Tee", "Water Bottle"])
  })
})

describe("filterAndSortProducts — sort", () => {
  it("sorts price ascending", () => {
    expect(titles(filterAndSortProducts(all, { sort: "price-asc" }))).toEqual([
      "Camp Mug",
      "Water Bottle",
      "Merino Tee",
      "Alpine Jacket",
    ])
  })

  it("sorts price descending", () => {
    expect(titles(filterAndSortProducts(all, { sort: "price-desc" }))).toEqual([
      "Alpine Jacket",
      "Merino Tee",
      "Water Bottle",
      "Camp Mug",
    ])
  })

  it("sorts by name A–Z", () => {
    expect(titles(filterAndSortProducts(all, { sort: "name" }))).toEqual([
      "Alpine Jacket",
      "Camp Mug",
      "Merino Tee",
      "Water Bottle",
    ])
  })

  it("sorts by rating desc with unrated last", () => {
    expect(titles(filterAndSortProducts(all, { sort: "rating" }))).toEqual([
      "Alpine Jacket",
      "Camp Mug",
      "Merino Tee",
      "Water Bottle",
    ])
  })

  it("featured sort puts featured first, then alphabetical", () => {
    expect(titles(filterAndSortProducts(all, { sort: "featured" }))).toEqual([
      "Alpine Jacket",
      "Merino Tee",
      "Camp Mug",
      "Water Bottle",
    ])
  })

  it("does not mutate the input array", () => {
    const input = [...all]
    filterAndSortProducts(input, { sort: "price-asc" })
    expect(input).toEqual(all)
  })
})
