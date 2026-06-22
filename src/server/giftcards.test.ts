import { describe, expect, it, vi } from "vitest"
import { getGiftCard, issueGiftCard, redeemGiftCard } from "./giftcards"

// Avoid filesystem side effects: the store runs purely in-memory under test.
// (vitest hoists this mock above the import above at runtime.)
vi.mock("node:fs", () => ({
  existsSync: () => false,
  mkdirSync: () => undefined,
  readFileSync: () => "{}",
  writeFileSync: () => undefined,
}))

describe("gift card store", () => {
  it("issues a card with the given balance", () => {
    const card = issueGiftCard(50)
    expect(card.balance).toBe(50)
    expect(card.initialBalance).toBe(50)
    expect(card.code).toMatch(/^GIFT-/)
    expect(getGiftCard(card.code)?.balance).toBe(50)
  })

  it("redeems partially and decrements the balance", () => {
    const card = issueGiftCard(50)
    const r = redeemGiftCard(card.code, 20)
    expect(r.applied).toBe(20)
    expect(r.balance).toBe(30)
    expect(getGiftCard(card.code)?.balance).toBe(30)
  })

  it("caps redemption at the remaining balance", () => {
    const card = issueGiftCard(10)
    const r = redeemGiftCard(card.code, 25)
    expect(r.applied).toBe(10)
    expect(r.balance).toBe(0)
  })

  it("returns 0 applied for unknown codes", () => {
    expect(redeemGiftCard("GIFT-FAKE-FAKE", 10).applied).toBe(0)
  })

  it("looks up codes case-insensitively", () => {
    const card = issueGiftCard(25)
    expect(getGiftCard(card.code.toLowerCase())?.code).toBe(card.code)
  })
})
