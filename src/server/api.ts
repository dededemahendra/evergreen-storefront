import { Hono } from "hono"
import { createOrderSchema } from "@/lib/shop/types"
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

api.post("/orders", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid order", issues: parsed.error.flatten() },
      400,
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
