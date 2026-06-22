import { describe, expect, it } from "vitest"
import { validateDiscount } from "./discounts"

describe("validateDiscount", () => {
  it("accepts a valid percentage code (case-insensitive)", () => {
    const r = validateDiscount("welcome10", 30)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.discount).toMatchObject({ kind: "percent", value: 10 })
  })

  it("rejects an unknown code", () => {
    expect(validateDiscount("NOPE", 100).ok).toBe(false)
  })

  it("enforces a minimum subtotal", () => {
    expect(validateDiscount("SAVE20", 50).ok).toBe(false)
    const ok = validateDiscount("SAVE20", 100)
    expect(ok.ok).toBe(true)
    if (ok.ok) expect(ok.discount).toMatchObject({ kind: "fixed", value: 20 })
  })

  it("gates free shipping on its minimum", () => {
    expect(validateDiscount("FREESHIP", 40).ok).toBe(false)
    expect(validateDiscount("FREESHIP", 60).ok).toBe(true)
  })
})
