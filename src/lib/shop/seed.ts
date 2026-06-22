import type { Category, Product, ProductVariant } from "./types"

/**
 * Local seed catalog. This is the fallback data source used whenever Sanity is
 * not configured (no `VITE_SANITY_PROJECT_ID`), so the storefront runs fully
 * end-to-end out of the box. The same shapes are produced by the Sanity mappers
 * in `queries.ts`, so swapping to live content requires no UI changes.
 *
 * Images use deterministic picsum.photos seeds so they are stable across runs.
 */

const img = (seed: string, n = 1) =>
  `https://picsum.photos/seed/${seed}-${n}/900/900`

export const seedCategories: Category[] = [
  {
    id: "cat-apparel",
    slug: "apparel",
    title: "Apparel",
    description: "Layers and basics built to last.",
  },
  {
    id: "cat-outdoor",
    slug: "outdoor",
    title: "Outdoor",
    description: "Gear for trails, camp, and everything between.",
  },
  {
    id: "cat-home",
    slug: "home",
    title: "Home",
    description: "Quiet, useful objects for everyday spaces.",
  },
  {
    id: "cat-accessories",
    slug: "accessories",
    title: "Accessories",
    description: "The finishing details.",
  },
]

function variant(
  id: string,
  title: string,
  price: number,
  options: Record<string, string> = {},
  inventory = 40
): ProductVariant {
  return { id, title, options, price, inventory, sku: id.toUpperCase() }
}

/** Helper for the common "Size" matrix used by apparel items. */
function sizeVariants(prefix: string, price: number): ProductVariant[] {
  return ["S", "M", "L", "XL"].map((size, i) =>
    variant(
      `${prefix}-${size.toLowerCase()}`,
      size,
      price,
      { Size: size },
      30 - i * 4
    )
  )
}

export const seedProducts: Product[] = [
  {
    id: "p-alpine-jacket",
    slug: "alpine-shell-jacket",
    title: "Alpine Shell Jacket",
    description: "A weatherproof 3-layer shell that packs into its own pocket.",
    details:
      "Built for shoulder-season storms, the Alpine Shell pairs a 20K/20K waterproof-breathable membrane with fully taped seams and pit zips. The trim fit layers cleanly over a midlayer without bunching.",
    price: 189,
    compareAtPrice: 220,
    currency: "USD",
    images: [img("alpine", 1), img("alpine", 2), img("alpine", 3)],
    categorySlug: "apparel",
    categoryTitle: "Apparel",
    tags: ["waterproof", "shell", "bestseller"],
    featured: true,
    rating: 4.8,
    reviewCount: 214,
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    variants: sizeVariants("alpine", 189),
  },
  {
    id: "p-merino-tee",
    slug: "merino-everyday-tee",
    title: "Merino Everyday Tee",
    description: "Featherweight merino that resists odor wear after wear.",
    details:
      "17.5-micron merino wool makes this tee soft enough for daily wear and technical enough for the trail. Naturally temperature-regulating and quick to dry.",
    price: 68,
    currency: "USD",
    images: [img("merino", 1), img("merino", 2)],
    categorySlug: "apparel",
    categoryTitle: "Apparel",
    tags: ["merino", "basics"],
    featured: true,
    rating: 4.6,
    reviewCount: 98,
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    variants: sizeVariants("merino", 68),
  },
  {
    id: "p-fleece",
    slug: "grid-fleece-pullover",
    title: "Grid Fleece Pullover",
    description: "A breathable grid-back midlayer with a cozy collar.",
    details:
      "The grid-knit interior traps warmth while dumping moisture, making this the midlayer you reach for on cool mornings and cold summits alike.",
    price: 96,
    currency: "USD",
    images: [img("fleece", 1), img("fleece", 2)],
    categorySlug: "apparel",
    categoryTitle: "Apparel",
    tags: ["fleece", "midlayer"],
    featured: false,
    rating: 4.7,
    reviewCount: 61,
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    variants: sizeVariants("fleece", 96),
  },
  {
    id: "p-daypack",
    slug: "trailhead-daypack-22l",
    title: "Trailhead Daypack 22L",
    description: "A do-everything 22L pack with a floating lid and hip belt.",
    details:
      "From commutes to day hikes, the Trailhead carries it all with a ventilated back panel, hydration sleeve, and a roll-tight main compartment.",
    price: 142,
    currency: "USD",
    images: [img("daypack", 1), img("daypack", 2), img("daypack", 3)],
    categorySlug: "outdoor",
    categoryTitle: "Outdoor",
    tags: ["pack", "bestseller"],
    featured: true,
    rating: 4.9,
    reviewCount: 320,
    options: [{ name: "Color", values: ["Forest", "Slate", "Clay"] }],
    variants: [
      variant("daypack-forest", "Forest", 142, { Color: "Forest" }),
      variant("daypack-slate", "Slate", 142, { Color: "Slate" }),
      variant("daypack-clay", "Clay", 142, { Color: "Clay" }),
    ],
  },
  {
    id: "p-bottle",
    slug: "summit-insulated-bottle",
    title: "Summit Insulated Bottle",
    description: "Double-wall steel that keeps drinks cold for 24 hours.",
    details:
      "Vacuum-insulated 18/8 stainless steel with a leakproof cap. Holds ice overnight and shrugs off dents and trail abuse.",
    price: 34,
    currency: "USD",
    images: [img("bottle", 1), img("bottle", 2)],
    categorySlug: "outdoor",
    categoryTitle: "Outdoor",
    tags: ["hydration"],
    featured: false,
    rating: 4.5,
    reviewCount: 142,
    options: [{ name: "Size", values: ["18oz", "32oz"] }],
    variants: [
      variant("bottle-18", "18 oz", 34, { Size: "18oz" }),
      variant("bottle-32", "32 oz", 42, { Size: "32oz" }),
    ],
  },
  {
    id: "p-headlamp",
    slug: "lumen-rechargeable-headlamp",
    title: "Lumen Rechargeable Headlamp",
    description: "400 lumens, USB-C charging, and a red night mode.",
    details:
      "A featherlight headlamp with a tilt bracket, lock mode, and battery that recharges over USB-C in under two hours.",
    price: 49,
    currency: "USD",
    images: [img("headlamp", 1)],
    categorySlug: "outdoor",
    categoryTitle: "Outdoor",
    tags: ["lighting"],
    featured: false,
    rating: 4.4,
    reviewCount: 73,
    options: [],
    variants: [variant("headlamp-default", "Default", 49)],
  },
  {
    id: "p-mug",
    slug: "stoneware-camp-mug",
    title: "Stoneware Camp Mug",
    description: "A hand-glazed 12oz mug that feels right every morning.",
    details:
      "Reactive glaze means no two mugs are identical. Microwave- and dishwasher-safe, with a satisfying heft and a comfortable handle.",
    price: 28,
    currency: "USD",
    images: [img("mug", 1), img("mug", 2)],
    categorySlug: "home",
    categoryTitle: "Home",
    tags: ["ceramic", "kitchen"],
    featured: true,
    rating: 4.7,
    reviewCount: 54,
    options: [{ name: "Color", values: ["Moss", "Sand", "Charcoal"] }],
    variants: [
      variant("mug-moss", "Moss", 28, { Color: "Moss" }),
      variant("mug-sand", "Sand", 28, { Color: "Sand" }),
      variant("mug-charcoal", "Charcoal", 28, { Color: "Charcoal" }),
    ],
  },
  {
    id: "p-candle",
    slug: "cedar-soy-candle",
    title: "Cedar & Smoke Soy Candle",
    description: "Cedar, vetiver, and a wisp of woodsmoke. 60-hour burn.",
    details:
      "Hand-poured soy wax with a crackling wooden wick. Notes of cedarwood, vetiver, and smoked amber bring the forest indoors.",
    price: 32,
    currency: "USD",
    images: [img("candle", 1)],
    categorySlug: "home",
    categoryTitle: "Home",
    tags: ["candle", "gift"],
    featured: false,
    rating: 4.8,
    reviewCount: 88,
    options: [],
    variants: [variant("candle-default", "Default", 32)],
  },
  {
    id: "p-blanket",
    slug: "woolrich-throw-blanket",
    title: "Recycled Wool Throw",
    description: "A heavyweight throw woven from recycled wool.",
    details:
      "Woven from reclaimed wool fibers, this throw is warm, durable, and softer with every wash. Finished with whipstitched edges.",
    price: 118,
    currency: "USD",
    images: [img("blanket", 1), img("blanket", 2)],
    categorySlug: "home",
    categoryTitle: "Home",
    tags: ["textiles", "cozy"],
    featured: true,
    rating: 4.9,
    reviewCount: 47,
    options: [{ name: "Color", values: ["Heather", "Pine", "Rust"] }],
    variants: [
      variant("blanket-heather", "Heather", 118, { Color: "Heather" }),
      variant("blanket-pine", "Pine", 118, { Color: "Pine" }),
      variant("blanket-rust", "Rust", 118, { Color: "Rust" }),
    ],
  },
  {
    id: "p-beanie",
    slug: "ribbed-merino-beanie",
    title: "Ribbed Merino Beanie",
    description: "A snug, itch-free beanie in soft merino rib.",
    details:
      "A classic cuffed beanie knit from fine merino — warm without the itch, and packable enough to live in your jacket pocket.",
    price: 38,
    currency: "USD",
    images: [img("beanie", 1)],
    categorySlug: "accessories",
    categoryTitle: "Accessories",
    tags: ["merino", "winter"],
    featured: false,
    rating: 4.6,
    reviewCount: 39,
    options: [{ name: "Color", values: ["Oat", "Forest", "Black"] }],
    variants: [
      variant("beanie-oat", "Oat", 38, { Color: "Oat" }),
      variant("beanie-forest", "Forest", 38, { Color: "Forest" }),
      variant("beanie-black", "Black", 38, { Color: "Black" }),
    ],
  },
  {
    id: "p-socks",
    slug: "trail-crew-socks",
    title: "Trail Crew Socks",
    description: "Cushioned merino crew socks with arch support.",
    details:
      "Targeted cushioning, a seamless toe, and merino's natural odor resistance make these the last socks you'll want to take off.",
    price: 22,
    currency: "USD",
    images: [img("socks", 1)],
    categorySlug: "accessories",
    categoryTitle: "Accessories",
    tags: ["merino", "socks"],
    featured: false,
    rating: 4.7,
    reviewCount: 132,
    options: [{ name: "Size", values: ["M", "L"] }],
    variants: [
      variant("socks-m", "Medium", 22, { Size: "M" }),
      variant("socks-l", "Large", 22, { Size: "L" }),
    ],
  },
  {
    id: "p-wallet",
    slug: "bridle-leather-wallet",
    title: "Bridle Leather Wallet",
    description: "A slim bifold in full-grain leather that ages beautifully.",
    details:
      "Cut from vegetable-tanned bridle leather and saddle-stitched by hand, this slim bifold develops a rich patina over years of daily carry.",
    price: 72,
    currency: "USD",
    images: [img("wallet", 1), img("wallet", 2)],
    categorySlug: "accessories",
    categoryTitle: "Accessories",
    tags: ["leather", "gift"],
    featured: false,
    rating: 4.8,
    reviewCount: 65,
    options: [{ name: "Color", values: ["Tan", "Brown", "Black"] }],
    variants: [
      variant("wallet-tan", "Tan", 72, { Color: "Tan" }),
      variant("wallet-brown", "Brown", 72, { Color: "Brown" }),
      variant("wallet-black", "Black", 72, { Color: "Black" }),
    ],
  },
  {
    id: "p-gift-card",
    slug: "evergreen-gift-card",
    title: "Evergreen Gift Card",
    description: "The perfect gift — delivered instantly as a code.",
    details:
      "Choose an amount and we'll generate a unique gift card code at checkout, shown on your order confirmation. Redeemable against any future order until the balance runs out.",
    price: 25,
    currency: "USD",
    images: [img("giftcard", 1)],
    categorySlug: "accessories",
    categoryTitle: "Accessories",
    tags: ["gift"],
    featured: false,
    options: [{ name: "Amount", values: ["$25", "$50", "$100"] }],
    variants: [
      variant("gc-25", "$25", 25, { Amount: "$25" }, 9999),
      variant("gc-50", "$50", 50, { Amount: "$50" }, 9999),
      variant("gc-100", "$100", 100, { Amount: "$100" }, 9999),
    ],
    kind: "gift_card",
  },
]
