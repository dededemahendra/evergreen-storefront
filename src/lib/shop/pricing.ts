import { siteConfig } from "@/config/site"
import type { CartItem } from "./types"

/**
 * Money / totals helpers. Shared by the cart UI and the order API so the
 * customer-facing totals always match what the server records.
 *
 * All inputs/outputs are in major currency units (e.g. dollars). We round to
 * cents on every operation to keep floating-point error from accumulating.
 */

/** Flat shipping fee applied when the order is below the free-shipping threshold. */
export const SHIPPING_FLAT = 9
/** Orders at or above this subtotal ship free. */
export const FREE_SHIPPING_THRESHOLD = 75
/** Simple flat tax rate for the MVP. Replace with a real tax provider later. */
export const TAX_RATE = 0.08

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export interface OrderTotals {
  subtotal: number
  shipping: number
  tax: number
  total: number
  /** Amount still needed to unlock free shipping (0 once unlocked). */
  amountToFreeShipping: number
}

export function computeTotals(items: CartItem[]): OrderTotals {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const tax = roundMoney(subtotal * TAX_RATE)
  const total = roundMoney(subtotal + shipping + tax)
  const amountToFreeShipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : roundMoney(FREE_SHIPPING_THRESHOLD - subtotal)

  return { subtotal, shipping, tax, total, amountToFreeShipping }
}

export function formatPrice(
  amount: number,
  currency: string = siteConfig.currency,
): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency,
  }).format(amount)
}
