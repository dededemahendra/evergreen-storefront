import { createClient } from "@sanity/client"

/**
 * Sanity read client. The storefront only reads published content, so we use
 * the CDN and require no token. When `VITE_SANITY_PROJECT_ID` is not set,
 * `sanityClient` is null and the data layer transparently falls back to the
 * local seed catalog (see `data.ts`). Image fields are projected to direct CDN
 * URLs in GROQ (`asset->url`), so no image-url builder is needed here.
 */

export const sanityProjectId = import.meta.env.VITE_SANITY_PROJECT_ID
export const sanityDataset = import.meta.env.VITE_SANITY_DATASET ?? "production"
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION ?? "2024-10-01"

export const sanityEnabled = Boolean(sanityProjectId)

export const sanityClient = sanityProjectId
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion,
      useCdn: true,
    })
  : null
