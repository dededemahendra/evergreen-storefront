import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { siteConfig } from "@/config/site"
import { computeTotals } from "@/lib/shop/pricing"
import { createOrderSchema, orderSchema } from "@/lib/shop/types"
import type { CreateOrderInput, Order } from "@/lib/shop/types"

/**
 * Order store for the MVP.
 *
 * Orders are kept in memory and mirrored to `.data/orders.json` so they survive
 * dev-server HMR reloads and restarts (which keeps the confirmation page valid).
 * Swap this module for a real database or a Sanity write client when you're
 * ready — the public API (`createOrder` / `getOrder`) stays the same.
 */

const DATA_DIR = join(process.cwd(), ".data")
const DATA_FILE = join(DATA_DIR, "orders.json")

function loadOrders(): Map<string, Order> {
  try {
    if (!existsSync(DATA_FILE)) return new Map()
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as unknown
    const entries = Object.entries(raw as Record<string, unknown>)
    const map = new Map<string, Order>()
    for (const [id, value] of entries) {
      const parsed = orderSchema.safeParse(value)
      if (parsed.success) map.set(id, parsed.data)
    }
    return map
  } catch {
    return new Map()
  }
}

const orders = loadOrders()

function persist() {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(
      DATA_FILE,
      JSON.stringify(Object.fromEntries(orders), null, 2)
    )
  } catch {
    // Best-effort persistence; the in-memory copy is still authoritative.
  }
}

export function createOrder(input: CreateOrderInput): Order {
  const { items, customer } = createOrderSchema.parse(input)
  const totals = computeTotals(items)
  const id = `EVG-${randomUUID().slice(0, 8).toUpperCase()}`

  // TODO(payments): create a Stripe PaymentIntent here and derive `status` from
  // the charge result. For the MVP we simulate an immediately-paid order.
  const order: Order = {
    id,
    items,
    customer,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    currency: siteConfig.currency,
    status: "paid",
    createdAt: new Date().toISOString(),
  }

  orders.set(id, order)
  persist()
  return order
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id)
}
