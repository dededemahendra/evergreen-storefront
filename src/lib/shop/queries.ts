import groq from "groq"
import { z } from "zod"
import { categorySchema, productSchema } from "./types"
import type { Category, Product } from "./types"

/**
 * GROQ queries + type-safe mappers for the Sanity content source.
 *
 * Sanity stores variant options as an array of `{ name, value }` objects (GROQ
 * can't build dynamic-key objects), so the raw schemas below validate the wire
 * shape and `.transform()` it into the storefront's `Product` shape. Image
 * fields are projected to direct CDN URLs via `asset->url`.
 */

const PRODUCT_PROJECTION = groq`{
  "id": _id,
  "slug": slug.current,
  title,
  description,
  details,
  price,
  compareAtPrice,
  currency,
  "images": images[].asset->url,
  "categorySlug": category->slug.current,
  "categoryTitle": category->title,
  tags,
  featured,
  rating,
  reviewCount,
  options[]{ name, values },
  variants[]{
    "id": coalesce(sku, _key),
    title,
    price,
    sku,
    inventory,
    options[]{ name, value }
  }
}`

export const productsQuery = groq`*[_type == "product"] | order(featured desc, title asc) ${PRODUCT_PROJECTION}`

export const featuredProductsQuery = groq`*[_type == "product" && featured == true] | order(title asc) ${PRODUCT_PROJECTION}`

export const productBySlugQuery = groq`*[_type == "product" && slug.current == $slug][0] ${PRODUCT_PROJECTION}`

export const productsByCategoryQuery = groq`*[_type == "product" && category->slug.current == $category] | order(featured desc, title asc) ${PRODUCT_PROJECTION}`

export const categoriesQuery = groq`*[_type == "category"] | order(title asc){
  "id": _id,
  "slug": slug.current,
  title,
  description
}`

const rawVariantSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    price: z.number(),
    sku: z.string().nullish(),
    inventory: z.number().nullish(),
    options: z
      .array(z.object({ name: z.string(), value: z.string() }))
      .nullish(),
  })
  .transform((v) => ({
    id: v.id,
    title: v.title,
    price: v.price,
    sku: v.sku ?? undefined,
    inventory: v.inventory ?? 0,
    options: Object.fromEntries(
      (v.options ?? []).map((o) => [o.name, o.value])
    ),
  }))

const rawProductSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullish(),
    details: z.string().nullish(),
    price: z.number(),
    compareAtPrice: z.number().nullish(),
    currency: z.string().nullish(),
    images: z.array(z.string()).nullish(),
    categorySlug: z.string().nullish(),
    categoryTitle: z.string().nullish(),
    tags: z.array(z.string()).nullish(),
    featured: z.boolean().nullish(),
    rating: z.number().nullish(),
    reviewCount: z.number().nullish(),
    options: z
      .array(z.object({ name: z.string(), values: z.array(z.string()) }))
      .nullish(),
    variants: z.array(rawVariantSchema).min(1),
  })
  .transform((d) => ({
    id: d.id,
    slug: d.slug,
    title: d.title,
    description: d.description ?? "",
    details: d.details ?? undefined,
    price: d.price,
    compareAtPrice: d.compareAtPrice ?? undefined,
    currency: d.currency ?? "USD",
    images: (d.images ?? []).filter(Boolean),
    categorySlug: d.categorySlug ?? undefined,
    categoryTitle: d.categoryTitle ?? undefined,
    tags: d.tags ?? [],
    featured: d.featured ?? false,
    rating: d.rating ?? undefined,
    reviewCount: d.reviewCount ?? undefined,
    options: d.options ?? [],
    variants: d.variants,
  }))

export function mapSanityProduct(doc: unknown): Product {
  return productSchema.parse(rawProductSchema.parse(doc))
}

export function mapSanityCategory(doc: unknown): Category {
  return categorySchema.parse(doc)
}
