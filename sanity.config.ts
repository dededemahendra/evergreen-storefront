import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./sanity/schemaTypes"

/**
 * Sanity Studio configuration. Run with `pnpm studio` (which calls `sanity dev`).
 * Set SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET in your `.env` first.
 *
 * This file is intentionally excluded from the app's tsconfig — it's built by
 * the Sanity CLI, not by the storefront's Vite/TanStack Start pipeline.
 */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? ""
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production"

export default defineConfig({
  name: "default",
  title: "Evergreen Studio",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
