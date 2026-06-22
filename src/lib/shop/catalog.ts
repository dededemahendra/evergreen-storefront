import type { Product } from "./types"

/**
 * Pure catalog filtering + sorting. Driven by URL search params on the products
 * route and applied client-side to the loaded product set (see the design spec:
 * docs/superpowers/specs/2026-06-22-catalog-search-sort-filter-design.md).
 */

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name"

export const SORT_OPTIONS: ReadonlyArray<{
  value: ProductSort
  label: string
}> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest rated" },
  { value: "name", label: "Name: A–Z" },
]

export const DEFAULT_SORT: ProductSort = "featured"

export function isProductSort(value: unknown): value is ProductSort {
  return SORT_OPTIONS.some((o) => o.value === value)
}

export interface CatalogControls {
  q?: string
  sort?: ProductSort
  minPrice?: number
  maxPrice?: number
}

/** Inclusive price bounds across a product set, rounded out to whole units. */
export function getPriceBounds(products: Product[]): {
  min: number
  max: number
} {
  if (products.length === 0) return { min: 0, max: 0 }
  const prices = products.map((p) => p.price)
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  }
}

function matchesQuery(product: Product, query: string): boolean {
  const haystack = [product.title, product.description, ...product.tags]
    .join(" ")
    .toLowerCase()
  // Every whitespace-separated term must appear (AND semantics).
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const copy = [...products]
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price)
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price)
    case "rating":
      // Highest first; products without a rating sort last.
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    case "name":
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case "featured":
    default:
      return copy.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return a.title.localeCompare(b.title)
      })
  }
}

export function filterAndSortProducts(
  products: Product[],
  controls: CatalogControls
): Product[] {
  const { q, sort = DEFAULT_SORT, minPrice, maxPrice } = controls
  const query = q?.trim() ?? ""

  const filtered = products.filter((product) => {
    if (query && !matchesQuery(product, query)) return false
    if (minPrice != null && product.price < minPrice) return false
    if (maxPrice != null && product.price > maxPrice) return false
    return true
  })

  return sortProducts(filtered, sort)
}
