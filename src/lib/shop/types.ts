import { z } from "zod"

/**
 * Domain model for the storefront. Schemas are defined with Zod so the same
 * definitions validate data coming from Sanity, the seed dataset, and the order
 * API — and TypeScript types are derived from them (single source of truth).
 *
 * Money is represented as a `number` in the store's major currency unit (e.g.
 * dollars). All arithmetic on money goes through `lib/shop/pricing.ts`, which
 * rounds to cents to avoid floating-point drift.
 */

export const productOptionSchema = z.object({
  /** e.g. "Size" or "Color" */
  name: z.string(),
  values: z.array(z.string()).min(1),
})
export type ProductOption = z.infer<typeof productOptionSchema>

export const productVariantSchema = z.object({
  id: z.string(),
  /** Human label, e.g. "Medium / Forest" */
  title: z.string(),
  /** Map of option name -> selected value, e.g. { Size: "M", Color: "Forest" } */
  options: z.record(z.string(), z.string()).default({}),
  price: z.number().nonnegative(),
  sku: z.string().optional(),
  inventory: z.number().int().nonnegative().default(0),
})
export type ProductVariant = z.infer<typeof productVariantSchema>

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
})
export type Category = z.infer<typeof categorySchema>

export const productKindSchema = z.enum(["standard", "gift_card"])
export type ProductKind = z.infer<typeof productKindSchema>

export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  /** Short marketing line shown on cards. */
  description: z.string(),
  /** Longer body copy shown on the product page. */
  details: z.string().optional(),
  /** Base / display price in major currency units. */
  price: z.number().nonnegative(),
  /** Optional original price for showing a discount. */
  compareAtPrice: z.number().nonnegative().optional(),
  currency: z.string().default("USD"),
  images: z.array(z.string()).default([]),
  categorySlug: z.string().optional(),
  categoryTitle: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  options: z.array(productOptionSchema).default([]),
  variants: z.array(productVariantSchema).min(1),
  kind: productKindSchema.optional(),
})
export type Product = z.infer<typeof productSchema>

/** A single line in the shopping cart / an order. */
export const cartItemSchema = z.object({
  productId: z.string(),
  productSlug: z.string(),
  variantId: z.string(),
  title: z.string(),
  variantTitle: z.string(),
  price: z.number().nonnegative(),
  image: z.string().optional(),
  quantity: z.number().int().positive(),
  kind: productKindSchema.optional(),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const checkoutCustomerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  postalCode: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  phone: z.string().optional(),
})
export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>

export const discountKindSchema = z.enum(["percent", "fixed", "free_shipping"])
export type DiscountKind = z.infer<typeof discountKindSchema>

/** A validated promo code, as returned by `POST /api/discounts/validate`. */
export const discountSchema = z.object({
  code: z.string(),
  kind: discountKindSchema,
  value: z.number().nonnegative(),
  label: z.string(),
})
export type Discount = z.infer<typeof discountSchema>

/** Request body accepted by `POST /api/orders`. */
export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart is empty"),
  customer: checkoutCustomerSchema,
  discountCode: z.string().optional(),
  giftCardCode: z.string().optional(),
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
])
export type OrderStatus = z.infer<typeof orderStatusSchema>

/** A gift card issued by an order (shown on the confirmation page). */
export const issuedGiftCardSchema = z.object({
  code: z.string(),
  balance: z.number(),
})
export type IssuedGiftCard = z.infer<typeof issuedGiftCardSchema>

export const orderSchema = z.object({
  id: z.string(),
  items: z.array(cartItemSchema),
  customer: checkoutCustomerSchema,
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  total: z.number(),
  currency: z.string(),
  status: orderStatusSchema,
  createdAt: z.string(),
  discountCode: z.string().optional(),
  discountAmount: z.number().default(0),
  giftCardCode: z.string().optional(),
  giftCardApplied: z.number().default(0),
  amountDue: z.number().optional(),
  issuedGiftCards: z.array(issuedGiftCardSchema).optional(),
})
export type Order = z.infer<typeof orderSchema>
