import { z } from "zod"
import { discountSchema } from "@/lib/shop/types"
import type { Discount } from "@/lib/shop/types"

const responseSchema = z.object({
  discount: discountSchema.optional(),
  error: z.string().optional(),
})

/** Validate a promo code against the current subtotal via the Hono API. */
export async function validateDiscountCode(
  code: string,
  subtotal: number
): Promise<Discount> {
  const res = await fetch("/api/discounts/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  })
  const json = await res.json().catch(() => null)
  const parsed = responseSchema.safeParse(json)

  if (!res.ok || !parsed.success || !parsed.data.discount) {
    throw new Error(
      (parsed.success && parsed.data.error) || "That code isn't valid."
    )
  }
  return parsed.data.discount
}
