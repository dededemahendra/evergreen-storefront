import { Hono } from "hono"
import { z } from "zod"
import { createOrderSchema } from "@/lib/shop/types"
import { validateDiscount } from "./discounts"
import { getGiftCard } from "./giftcards"
import { createOrder, getOrder } from "./orders"

/**
 * Hono API mounted into TanStack Start at `/api` (see `routes/api.$.tsx`).
 *
 * This is the storefront's HTTP surface for mutations and anything external
 * (e.g. a future Stripe webhook). Catalog *reads* go through type-safe server
 * functions instead (see `lib/shop/data.ts`).
 */
export const api = new Hono().basePath("/api")

api.get("/health", (c) => c.json({ ok: true }))

const validateDiscountSchema = z.object({
  code: z.string(),
  subtotal: z.number().nonnegative(),
})

api.post("/discounts/validate", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = validateDiscountSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400)
  const result = validateDiscount(parsed.data.code, parsed.data.subtotal)
  if (!result.ok) return c.json({ error: result.reason }, 400)
  return c.json({ discount: result.discount })
})

api.get("/giftcards/:code", (c) => {
  const card = getGiftCard(c.req.param("code"))
  if (!card || card.balance <= 0) {
    return c.json({ error: "That gift card code isn't valid." }, 404)
  }
  return c.json({ code: card.code, balance: card.balance })
})

api.post("/orders", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid order", issues: parsed.error.flatten() },
      400
    )
  }
  const order = createOrder(parsed.data)
  return c.json({ order }, 201)
})

api.get("/orders/:id", (c) => {
  const order = getOrder(c.req.param("id"))
  if (!order) return c.json({ error: "Order not found" }, 404)
  return c.json({ order })
})
