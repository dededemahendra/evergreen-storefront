import { createFileRoute } from "@tanstack/react-router"
import { api } from "@/server/api"

/**
 * Catch-all server route that hands every `/api/*` request to the Hono app.
 * This route has no client component — it only defines server handlers.
 */
const handler = ({ request }: { request: Request }) => api.fetch(request)

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
      PUT: handler,
      PATCH: handler,
      DELETE: handler,
      OPTIONS: handler,
    },
  },
})
