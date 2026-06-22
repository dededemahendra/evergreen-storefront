/**
 * Seed a Sanity dataset with the local catalog (categories + products),
 * uploading each product image as a Sanity asset. Idempotent: documents use
 * deterministic ids (`category-<slug>` / `product-<slug>`) and are upserted with
 * createOrReplace, so re-running updates rather than duplicates.
 *
 * Usage:
 *   1. Put these in `.env` (gitignored):
 *        VITE_SANITY_PROJECT_ID=your_project_id
 *        VITE_SANITY_DATASET=production
 *        SANITY_API_WRITE_TOKEN=sk... (an Editor token from manage.sanity.io)
 *   2. pnpm seed:sanity
 */
import process from "node:process"
import { createClient } from "@sanity/client"
import { seedCategories, seedProducts } from "../src/lib/shop/seed"
import type { Product } from "../src/lib/shop/types"

try {
  process.loadEnvFile(".env")
} catch {
  // No .env file — rely on the ambient environment.
}

const projectId =
  process.env.VITE_SANITY_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID
const dataset =
  process.env.VITE_SANITY_DATASET ??
  process.env.SANITY_STUDIO_DATASET ??
  "production"
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error(
    "Missing config. Set VITE_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env"
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
})

async function uploadImage(url: string, label: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image ${url} (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload("image", buffer, {
    filename: `${label}.jpg`,
  })
  return asset._id
}

async function imageRefs(product: Product) {
  const refs: Array<Record<string, unknown>> = []
  for (let i = 0; i < product.images.length; i++) {
    try {
      const assetId = await uploadImage(
        product.images[i],
        `${product.slug}-${i}`
      )
      refs.push({
        _type: "image",
        _key: `img-${i}`,
        asset: { _type: "reference", _ref: assetId },
      })
    } catch (error) {
      console.warn(`  ! skipped image ${i} for ${product.slug}:`, error)
    }
  }
  return refs
}

async function main() {
  console.log(`Seeding Sanity project ${projectId} / dataset ${dataset}…`)

  for (const category of seedCategories) {
    await client.createOrReplace({
      _id: `category-${category.slug}`,
      _type: "category",
      title: category.title,
      slug: { _type: "slug", current: category.slug },
      description: category.description,
    })
    console.log(`  ✓ category ${category.title}`)
  }

  for (const product of seedProducts) {
    const images = await imageRefs(product)
    await client.createOrReplace({
      _id: `product-${product.slug}`,
      _type: "product",
      title: product.title,
      slug: { _type: "slug", current: product.slug },
      kind: product.kind ?? "standard",
      description: product.description,
      details: product.details,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: product.currency,
      images,
      category: product.categorySlug
        ? { _type: "reference", _ref: `category-${product.categorySlug}` }
        : undefined,
      tags: product.tags,
      featured: product.featured,
      rating: product.rating,
      reviewCount: product.reviewCount,
      options: product.options.map((o, i) => ({
        _key: `opt-${i}`,
        name: o.name,
        values: o.values,
      })),
      variants: product.variants.map((v) => ({
        _key: v.id,
        title: v.title,
        price: v.price,
        sku: v.sku,
        inventory: v.inventory,
        options: Object.entries(v.options).map(([name, value], i) => ({
          _key: `${v.id}-${i}`,
          name,
          value,
        })),
      })),
    })
    console.log(`  ✓ product ${product.title}`)
  }

  console.log(
    `Done — ${seedCategories.length} categories, ${seedProducts.length} products.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
