import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { getOrder } from "@/server/orders"
import type { Order } from "@/lib/shop/types"

/**
 * Server function for reading an order by id. Used by the confirmation route
 * loader so the server-only order store (node:fs) never reaches the client
 * bundle.
 */
export const getOrderById = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: id }): Promise<Order | null> => getOrder(id) ?? null)
