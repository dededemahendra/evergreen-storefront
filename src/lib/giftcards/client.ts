import { z } from "zod"

const responseSchema = z.object({
  code: z.string(),
  balance: z.number(),
})

export interface GiftCardInfo {
  code: string
  balance: number
}

/** Look up a gift card's current balance via the Hono API. */
export async function checkGiftCard(code: string): Promise<GiftCardInfo> {
  const res = await fetch(`/api/giftcards/${encodeURIComponent(code.trim())}`)
  const json = await res.json().catch(() => null)
  const parsed = responseSchema.safeParse(json)
  if (!res.ok || !parsed.success) {
    throw new Error("That gift card code isn't valid.")
  }
  return parsed.data
}
