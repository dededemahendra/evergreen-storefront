import { describe, expect, it } from "vitest"
import { computeTotals, discountAmount } from "./pricing"
import type { CartItem, Discount } from "./types"

function item(price: number, quantity = 1): CartItem {
  return {
    productId: "p",
    productSlug: "p",
    variantId: `v-${price}-${quantity}`,
    title: "P",
    variantTitle: "Default",
    price,
    quantity,
  }
}

const percent10: Discount = {
  code: "X",
  kind: "percent",
  value: 10,
  label: "",
}
const fixed20: Discount = { code: "X", kind: "fixed", value: 20, label: "" }
const freeShip: Discount = {
  code: "X",
  kind: "free_shipping",
  value: 0,
  label: "",
}

describe("discountAmount", () => {
  it("computes a percentage", () => {
    expect(discountAmount(percent10, 100)).toBe(10)
  })
  it("caps a fixed amount at the subtotal", () => {
    expect(discountAmount(fixed20, 10)).toBe(10)
    expect(discountAmount(fixed20, 100)).toBe(20)
  })
  it("is zero for free_shipping and undefined", () => {
    expect(discountAmount(freeShip, 100)).toBe(0)
    expect(discountAmount(undefined, 100)).toBe(0)
  })
})

describe("computeTotals", () => {
  it("no discount: flat shipping + tax under threshold", () => {
    const t = computeTotals([item(50)])
    expect(t).toMatchObject({
      subtotal: 50,
      discountAmount: 0,
      shipping: 9,
      tax: 4,
      total: 63,
    })
  })

  it("percent discount reduces subtotal and taxes the discounted base", () => {
    const t = computeTotals([item(50)], { discount: percent10 })
    expect(t.discountAmount).toBe(5)
    expect(t.shipping).toBe(9)
    expect(t.tax).toBe(3.6)
    expect(t.total).toBe(57.6)
  })

  it("fixed discount can drop the order to free shipping", () => {
    const t = computeTotals([item(100)], { discount: fixed20 })
    expect(t.discountAmount).toBe(20)
    expect(t.shipping).toBe(0) // discounted subtotal 80 >= 75
    expect(t.tax).toBe(6.4)
    expect(t.total).toBe(86.4)
  })

  it("free_shipping zeroes shipping without touching the subtotal", () => {
    const t = computeTotals([item(60)], { discount: freeShip })
    expect(t.discountAmount).toBe(0)
    expect(t.shipping).toBe(0)
    expect(t.tax).toBe(4.8)
    expect(t.total).toBe(64.8)
  })

  it("applies a gift card against the total and sets amount due", () => {
    const t = computeTotals([item(50)], { giftCardBalance: 30 })
    expect(t.total).toBe(63) // 50 + 9 shipping + 4 tax
    expect(t.giftCardApplied).toBe(30)
    expect(t.amountDue).toBe(33)
  })

  it("caps the gift card at the total", () => {
    const t = computeTotals([item(50)], { giftCardBalance: 1000 })
    expect(t.giftCardApplied).toBe(t.total)
    expect(t.amountDue).toBe(0)
  })

  it("amount due equals total when no gift card", () => {
    const t = computeTotals([item(50)])
    expect(t.giftCardApplied).toBe(0)
    expect(t.amountDue).toBe(t.total)
  })
})
