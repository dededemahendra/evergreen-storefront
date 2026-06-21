/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sanity project id. When unset, the storefront falls back to seed data. */
  readonly VITE_SANITY_PROJECT_ID?: string
  readonly VITE_SANITY_DATASET?: string
  readonly VITE_SANITY_API_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
