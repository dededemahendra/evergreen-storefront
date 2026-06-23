import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { siteConfig } from "@/config/site"
import { getProducts } from "@/lib/shop/data"
import { resolveOrderItems } from "@/lib/shop/order-items"
import { computeTotals, roundMoney } from "@/lib/shop/pricing"
import { createOrderSchema, orderSchema } from "@/lib/shop/types"
import type {
  CreateOrderInput,
  Discount,
  IssuedGiftCard,
  Order,
} from "@/lib/shop/types"
import { validateDiscount } from "./discounts"
import { getGiftCard, issueGiftCard, redeemGiftCard } from "./giftcards"

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

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const {
    items: clientItems,
    customer,
    discountCode,
    giftCardCode,
  } = createOrderSchema.parse(input)

  // SECURITY: never trust client-supplied prices/titles/kind. Re-resolve every
  // line against the authoritative catalog so a tampered cart can't change what
  // is charged or what gift-card value is minted. (Throws OrderValidationError
  // for unknown items — the API turns that into a 400.)
  const catalog = await getProducts({ data: {} })
  const items = resolveOrderItems(clientItems, catalog)

  // Re-validate the promo code server-side against the PHYSICAL subtotal (gift
  // cards don't count toward minimums or discounts). Invalid codes are dropped
  // so the order still succeeds at the correct price.
  let discount: Discount | undefined
  if (discountCode) {
    const result = validateDiscount(
      discountCode,
      computeTotals(items).physicalSubtotal
    )
    if (result.ok) discount = result.discount
  }

  const totals = computeTotals(items, { discount })

  // Apply a gift card atomically: redeemGiftCard's return value is the single
  // source of truth for how much was actually deducted, so concurrent orders
  // can't double-spend the same balance.
  let giftCardApplied = 0
  let appliedGiftCardCode: string | undefined
  if (giftCardCode) {
    const card = getGiftCard(giftCardCode)
    if (card) {
      const { applied } = redeemGiftCard(card.code, totals.total)
      if (applied > 0) {
        giftCardApplied = applied
        appliedGiftCardCode = card.code
      }
    }
  }
  const amountDue = roundMoney(totals.total - giftCardApplied)

  // Issue a gift card per gift-card unit purchased, at the TRUSTED price.
  const issuedGiftCards: IssuedGiftCard[] = []
  for (const item of items) {
    if (item.kind === "gift_card") {
      for (let i = 0; i < item.quantity; i++) {
        const issued = issueGiftCard(item.price)
        issuedGiftCards.push({ code: issued.code, balance: issued.balance })
      }
    }
  }

  const id = `EVG-${randomUUID().slice(0, 8).toUpperCase()}`

  // TODO(payments): create a Stripe PaymentIntent here and derive `status` from
  // the charge result. For the MVP we simulate an immediately-paid order.
  const order: Order = {
    id,
    items,
    customer,
    subtotal: totals.subtotal,
    discountCode: discount?.code,
    discountAmount: totals.discountAmount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    giftCardCode: giftCardApplied > 0 ? appliedGiftCardCode : undefined,
    giftCardApplied,
    amountDue,
    issuedGiftCards: issuedGiftCards.length > 0 ? issuedGiftCards : undefined,
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
