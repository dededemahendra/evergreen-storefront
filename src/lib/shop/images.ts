/** Neutral placeholder used when a product/cart image is missing (e.g. a Sanity
 *  product with no uploaded images). */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900"><rect width="100%" height="100%" fill="#e5e5e5"/><path d="M0 0h900v900H0z" fill="#e5e5e5"/></svg>',
  )

export function imageOrPlaceholder(url?: string): string {
  return url && url.length > 0 ? url : PLACEHOLDER_IMAGE
}
