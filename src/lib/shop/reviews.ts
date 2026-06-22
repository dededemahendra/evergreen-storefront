import type { Product } from "./types"

/**
 * Deterministic mock reviews. There's no review backend yet, so reviews are
 * generated from the product's id + aggregate rating/reviewCount using a seeded
 * PRNG. Determinism matters: the same output must be produced on the server and
 * the client, or hydration would mismatch — hence no Math.random / Date.now.
 */

export interface Review {
  id: string
  author: string
  rating: number
  title: string
  body: string
  date: string
  helpful: number
}

export interface ReviewBreakdownRow {
  stars: number
  count: number
}

export interface ReviewSummary {
  average: number
  total: number
  breakdown: ReviewBreakdownRow[] // 5★ down to 1★
}

const AUTHORS = [
  "Maya R.",
  "James T.",
  "Priya S.",
  "Liam K.",
  "Sofia M.",
  "Noah B.",
  "Ava L.",
  "Ethan W.",
  "Chloe D.",
  "Owen H.",
  "Isla F.",
  "Mason P.",
]

const MONTHS = [
  "May 2026",
  "Apr 2026",
  "Mar 2026",
  "Feb 2026",
  "Jan 2026",
  "Dec 2025",
  "Nov 2025",
  "Oct 2025",
]

const TITLES: Record<number, string[]> = {
  5: ["Exceeded expectations", "Absolutely love it", "Worth every penny"],
  4: ["Really happy with it", "Solid choice", "Great, with a small caveat"],
  3: ["It's fine", "Does the job", "Just okay"],
  2: ["Not quite right", "Expected more"],
  1: ["Disappointed", "Wouldn't buy again"],
}

const BODIES: Record<number, string[]> = {
  5: [
    "Beautifully made and clearly built to last. I reach for it constantly.",
    "The quality is obvious the moment you unbox it — no notes.",
    "Exactly what I hoped for. Fit, finish, and feel are all spot on.",
  ],
  4: [
    "Really solid overall; knocked one star off for a slightly slow delivery.",
    "Great product and looks even better in person. Sizing runs a touch large.",
    "Very happy with it — would have given five if the colour matched the photos exactly.",
  ],
  3: [
    "Decent, but not quite what I pictured. Fine for the price.",
    "Does the job. Nothing remarkable, nothing wrong.",
    "Okay quality — I was hoping for something a bit more premium.",
  ],
  2: [
    "The materials feel cheaper than I expected for the price.",
    "Didn't hold up as well as I'd hoped after a few weeks.",
  ],
  1: [
    "Unfortunately it didn't work out for me — returning it.",
    "Quality wasn't there. Expected much more.",
  ],
}

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

/** Star weights (5..1) clustered around the average rating. */
function normalizedWeights(average: number): number[] {
  const raw: number[] = []
  for (let stars = 5; stars >= 1; stars--) {
    raw.push(1 / (1 + Math.pow(stars - average, 2) * 2))
  }
  const sum = raw.reduce((a, b) => a + b, 0)
  return raw.map((x) => x / sum)
}

export function reviewSummary(product: Product): ReviewSummary {
  const total = product.reviewCount ?? 0
  const average = product.rating ?? 0
  if (total === 0) {
    return {
      average,
      total,
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
    }
  }
  const weights = normalizedWeights(average)
  const counts = weights.map((w) => Math.round(w * total))
  // Reconcile rounding drift onto the dominant (top) star.
  counts[0] += total - counts.reduce((a, b) => a + b, 0)
  return {
    average,
    total,
    breakdown: counts.map((count, i) => ({
      stars: 5 - i,
      count: Math.max(0, count),
    })),
  }
}

export function generateReviews(product: Product, max = 8): Review[] {
  const total = product.reviewCount ?? 0
  if (total === 0) return []
  const rng = mulberry32(hashSeed(product.id))
  const weights = normalizedWeights(product.rating ?? 5)
  const n = Math.min(total, max)

  const reviews: Review[] = []
  for (let i = 0; i < n; i++) {
    const roll = rng()
    let acc = 0
    let rating = 1
    for (let s = 0; s < 5; s++) {
      acc += weights[s]
      if (roll <= acc) {
        rating = 5 - s
        break
      }
    }
    reviews.push({
      id: `${product.id}-r${i}`,
      author: pick(AUTHORS, rng),
      rating,
      title: pick(TITLES[rating], rng),
      body: pick(BODIES[rating], rng),
      date: MONTHS[i % MONTHS.length],
      helpful: Math.floor(rng() * 38),
    })
  }
  return reviews
}
