import { siteConfig } from "@/config/site"
import type { CartItem, Discount } from "./types"

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
  discountAmount: number
  shipping: number
  tax: number
  total: number
  /** Gift-card balance applied against the total (0 if none). */
  giftCardApplied: number
  /** What the customer actually pays: total − giftCardApplied. */
  amountDue: number
  /** Amount still needed to unlock free shipping (0 once unlocked). */
  amountToFreeShipping: number
}

/** Discount value off the subtotal (free_shipping reduces shipping, not this). */
export function discountAmount(
  discount: Discount | undefined,
  subtotal: number
): number {
  if (!discount) return 0
  if (discount.kind === "percent") {
    return roundMoney(subtotal * (discount.value / 100))
  }
  if (discount.kind === "fixed") {
    return Math.min(roundMoney(discount.value), subtotal)
  }
  return 0
}

export function computeTotals(
  items: CartItem[],
  opts: { discount?: Discount; giftCardBalance?: number } = {}
): OrderTotals {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  const discount = opts.discount
  const discountAmt = discountAmount(discount, subtotal)
  const discountedSubtotal = roundMoney(subtotal - discountAmt)
  const qualifiesFreeShipping =
    discount?.kind === "free_shipping" ||
    discountedSubtotal === 0 ||
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD
  const shipping = qualifiesFreeShipping ? 0 : SHIPPING_FLAT
  const tax = roundMoney(discountedSubtotal * TAX_RATE)
  const total = roundMoney(discountedSubtotal + shipping + tax)
  const amountToFreeShipping = qualifiesFreeShipping
    ? 0
    : roundMoney(FREE_SHIPPING_THRESHOLD - discountedSubtotal)

  const giftCardApplied =
    opts.giftCardBalance != null
      ? Math.min(roundMoney(opts.giftCardBalance), total)
      : 0
  const amountDue = roundMoney(total - giftCardApplied)

  return {
    subtotal,
    discountAmount: discountAmt,
    shipping,
    tax,
    total,
    giftCardApplied,
    amountDue,
    amountToFreeShipping,
  }
}

export function formatPrice(
  amount: number,
  currency: string = siteConfig.currency
): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency,
  }).format(amount)
}
