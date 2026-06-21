/**
 * Central brand / store configuration. Tweak these values to rebrand the store
 * without hunting through components.
 */
export const siteConfig = {
  name: "Evergreen",
  tagline: "Thoughtfully made goods for home and the outdoors.",
  description:
    "Evergreen is a curated shop of durable, beautifully designed essentials for everyday life — at home and on the trail.",
  /** ISO 4217 currency code used across the storefront. */
  currency: "USD",
  /** BCP 47 locale used for number / currency formatting. */
  locale: "en-US",
  nav: [
    { label: "Shop all", to: "/products" },
    { label: "Apparel", to: "/products", search: { category: "apparel" } },
    { label: "Outdoor", to: "/products", search: { category: "outdoor" } },
    { label: "Home", to: "/products", search: { category: "home" } },
  ],
} as const

export type SiteConfig = typeof siteConfig
