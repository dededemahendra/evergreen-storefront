import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { sanityClient } from "./sanity"
import {
  categoriesQuery,
  featuredProductsQuery,
  mapSanityCategory,
  mapSanityProduct,
  productBySlugQuery,
  productsByCategoryQuery,
  productsQuery,
} from "./queries"
import { seedCategories, seedProducts } from "./seed"
import type { Category, Product } from "./types"

/**
 * Catalog data access, exposed as TanStack Start server functions so the Sanity
 * client and seed dataset stay out of the client bundle and any secrets stay
 * server-side. Route loaders call these; during SSR they run in-process, and on
 * client navigations they become a lightweight RPC.
 *
 * Every function transparently falls back to the local seed catalog when Sanity
 * is not configured.
 */

export const getProducts = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().optional() }))
  .handler(async ({ data }): Promise<Product[]> => {
    const { category } = data
    if (sanityClient) {
      const docs = await sanityClient.fetch<unknown[]>(
        category ? productsByCategoryQuery : productsQuery,
        category ? { category } : {}
      )
      return docs.map(mapSanityProduct)
    }
    return category
      ? seedProducts.filter((p) => p.categorySlug === category)
      : seedProducts
  })

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    if (sanityClient) {
      const docs = await sanityClient.fetch<unknown[]>(featuredProductsQuery)
      return docs.map(mapSanityProduct)
    }
    return seedProducts.filter((p) => p.featured)
  }
)

export const getProduct = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: slug }): Promise<Product | null> => {
    if (sanityClient) {
      const doc = await sanityClient.fetch<unknown>(productBySlugQuery, {
        slug,
      })
      return doc ? mapSanityProduct(doc) : null
    }
    return seedProducts.find((p) => p.slug === slug) ?? null
  })

export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    if (sanityClient) {
      const docs = await sanityClient.fetch<unknown[]>(categoriesQuery)
      return docs.map(mapSanityCategory)
    }
    return seedCategories
  }
)
