import { z } from "zod"
import { orderSchema } from "@/lib/shop/types"
import type { CreateOrderInput, Order } from "@/lib/shop/types"

const orderResponseSchema = z.object({
  order: orderSchema.optional(),
  error: z.string().optional(),
})

/** POST the cart + customer details to the Hono order API and return the order. */
export async function placeOrder(input: CreateOrderInput): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = await res.json().catch(() => null)
  const parsed = orderResponseSchema.safeParse(json)

  if (!res.ok || !parsed.success || !parsed.data.order) {
    const message =
      (parsed.success && parsed.data.error) ||
      "We couldn't place your order. Please try again."
    throw new Error(message)
  }

  return parsed.data.order
}
