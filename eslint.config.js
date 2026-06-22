//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    // Sanity Studio is built by the Sanity CLI and excluded from the app
    // tsconfig, so the type-aware ESLint parser can't (and shouldn't) lint it.
    ignores: [
      "eslint.config.js",
      ".prettierrc",
      "sanity/**",
      "sanity.config.ts",
      "sanity.cli.ts",
    ],
  },
]
