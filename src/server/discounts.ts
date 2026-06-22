import { formatPrice } from "@/lib/shop/pricing"
import type { Discount } from "@/lib/shop/types"

/**
 * Server-side promo code definitions + validation. Kept off the client (only the
 * Hono API and order creation import this) so the full code list isn't exposed;
 * the client only learns about a code it successfully validates.
 */

interface SeedDiscount extends Discount {
  minSubtotal?: number
  expiresAt?: string // ISO date
}

const seedDiscounts: SeedDiscount[] = [
  {
    code: "WELCOME10",
    kind: "percent",
    value: 10,
    label: "10% off your order",
  },
  {
    code: "SAVE20",
    kind: "fixed",
    value: 20,
    label: "$20 off",
    minSubtotal: 80,
  },
  {
    code: "FREESHIP",
    kind: "free_shipping",
    value: 0,
    label: "Free shipping",
    minSubtotal: 50,
  },
]

export type DiscountValidation =
  | { ok: true; discount: Discount }
  | { ok: false; reason: string }

export function validateDiscount(
  code: string,
  subtotal: number
): DiscountValidation {
  const found = seedDiscounts.find((d) => d.code === code.trim().toUpperCase())
  if (!found) return { ok: false, reason: "That code isn't valid." }
  if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: "That code has expired." }
  }
  if (found.minSubtotal != null && subtotal < found.minSubtotal) {
    return {
      ok: false,
      reason: `This code requires a ${formatPrice(found.minSubtotal)} minimum.`,
    }
  }
  return {
    ok: true,
    discount: {
      code: found.code,
      kind: found.kind,
      value: found.value,
      label: found.label,
    },
  }
}
