import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { randomBytes } from "node:crypto"
import { siteConfig } from "@/config/site"
import { roundMoney } from "@/lib/shop/pricing"

/**
 * Gift card store for the MVP. File-backed like the order store so issued cards
 * and their balances survive dev-server reloads. Swap for a real database when
 * ready — the public API (issue / get / redeem) stays the same.
 */

export interface GiftCard {
  code: string
  initialBalance: number
  balance: number
  currency: string
  createdAt: string
}

const DATA_DIR = join(process.cwd(), ".data")
const DATA_FILE = join(DATA_DIR, "giftcards.json")

function load(): Map<string, GiftCard> {
  try {
    if (!existsSync(DATA_FILE)) return new Map()
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Record<
      string,
      GiftCard
    >
    return new Map(Object.entries(raw))
  } catch {
    return new Map()
  }
}

const cards = load()

function persist() {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(cards), null, 2))
  } catch {
    // Best-effort persistence; the in-memory copy is still authoritative.
  }
}

function generateCode(): string {
  const part = () => randomBytes(2).toString("hex").toUpperCase()
  let code = `GIFT-${part()}-${part()}`
  while (cards.has(code)) code = `GIFT-${part()}-${part()}`
  return code
}

export function issueGiftCard(amount: number): GiftCard {
  const balance = roundMoney(amount)
  const card: GiftCard = {
    code: generateCode(),
    initialBalance: balance,
    balance,
    currency: siteConfig.currency,
    createdAt: new Date().toISOString(),
  }
  cards.set(card.code, card)
  persist()
  return card
}

export function getGiftCard(code: string): GiftCard | undefined {
  return cards.get(code.trim().toUpperCase())
}

/** Apply up to `amount` from the card's balance. Returns what was applied. */
export function redeemGiftCard(
  code: string,
  amount: number
): { applied: number; balance: number } {
  const card = cards.get(code.trim().toUpperCase())
  if (!card || card.balance <= 0 || amount <= 0) {
    return { applied: 0, balance: card?.balance ?? 0 }
  }
  const applied = Math.min(roundMoney(amount), card.balance)
  card.balance = roundMoney(card.balance - applied)
  persist()
  return { applied, balance: card.balance }
}
