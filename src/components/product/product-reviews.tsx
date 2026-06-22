import { useMemo, useState } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/product/star-rating"
import { generateReviews, reviewSummary } from "@/lib/shop/reviews"
import type { Review } from "@/lib/shop/reviews"
import type { Product } from "@/lib/shop/types"
import { cn } from "@/lib/utils"

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ProductReviews({ product }: { product: Product }) {
  const summary = useMemo(() => reviewSummary(product), [product])
  const reviews = useMemo(() => generateReviews(product), [product])
  const [filter, setFilter] = useState<number | null>(null)
  const [visible, setVisible] = useState(4)
  const [helpful, setHelpful] = useState<Record<string, boolean>>({})

  if (summary.total === 0) return null

  const maxRow = Math.max(...summary.breakdown.map((b) => b.count), 1)
  const filtered = filter ? reviews.filter((r) => r.rating === filter) : reviews
  const shown = filtered.slice(0, visible)

  return (
    <section className="border-t pt-10">
      <h2 className="mb-6 font-heading text-2xl font-semibold">
        Customer reviews
      </h2>

      <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
        {/* Summary */}
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <span className="font-heading text-5xl font-semibold">
              {summary.average.toFixed(1)}
            </span>
            <div className="pb-1">
              <StarRating rating={summary.average} />
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.total} reviews
              </p>
            </div>
          </div>

          <ul className="space-y-1.5">
            {summary.breakdown.map((row) => {
              const active = filter === row.stars
              return (
                <li key={row.stars}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilter(active ? null : row.stars)
                      setVisible(4)
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-sm transition hover:bg-muted",
                      active && "bg-muted"
                    )}
                  >
                    <span className="flex w-10 items-center gap-1 tabular-nums">
                      {row.stars}
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-amber-400"
                        style={{ width: `${(row.count / maxRow) * 100}%` }}
                      />
                    </span>
                    <span className="w-8 text-right text-muted-foreground tabular-nums">
                      {row.count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {filter ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter(null)}
              className="px-1.5"
            >
              Clear filter
            </Button>
          ) : null}
        </div>

        {/* Review list */}
        <div className="space-y-6">
          {shown.length === 0 ? (
            <p className="text-muted-foreground">
              No {filter}-star reviews yet.
            </p>
          ) : (
            shown.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                marked={Boolean(helpful[review.id])}
                onHelpful={() =>
                  setHelpful((h) => ({ ...h, [review.id]: !h[review.id] }))
                }
              />
            ))
          )}

          {visible < filtered.length ? (
            <Button variant="outline" onClick={() => setVisible((v) => v + 4)}>
              Show more reviews
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ReviewCard({
  review,
  marked,
  onHelpful,
}: {
  review: Review
  marked: boolean
  onHelpful: () => void
}) {
  return (
    <article className="border-b pb-6 last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {initials(review.author)}
        </span>
        <div>
          <p className="text-sm font-medium">{review.author}</p>
          <p className="text-xs text-muted-foreground">
            Verified buyer · {review.date}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <StarRating rating={review.rating} />
        <span className="text-sm font-medium">{review.title}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {review.body}
      </p>
      <button
        type="button"
        onClick={onHelpful}
        aria-pressed={marked}
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition hover:bg-muted",
          marked && "border-primary text-primary"
        )}
      >
        <ThumbsUp className="size-3.5" />
        Helpful ({review.helpful + (marked ? 1 : 0)})
      </button>
    </article>
  )
}
