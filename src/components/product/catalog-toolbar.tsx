import { useEffect, useRef, useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { SORT_OPTIONS } from "@/lib/shop/catalog"
import type { ProductSort } from "@/lib/shop/catalog"
import { formatPrice } from "@/lib/shop/pricing"
import { cn } from "@/lib/utils"

export interface CatalogToolbarChange {
  q?: string
  sort?: ProductSort
  minPrice?: number
  maxPrice?: number
}

export function CatalogToolbar({
  q,
  sort,
  bounds,
  minPrice,
  maxPrice,
  onChange,
}: {
  q: string
  sort: ProductSort
  bounds: { min: number; max: number }
  minPrice: number
  maxPrice: number
  onChange: (partial: CatalogToolbarChange) => void
}) {
  // Search text is local for instant typing; commits are debounced to the URL.
  const [search, setSearch] = useState(q)
  useEffect(() => setSearch(q), [q])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => clearTimeout(timer.current ?? undefined), [])

  function handleSearch(value: string) {
    setSearch(value)
    clearTimeout(timer.current ?? undefined)
    timer.current = setTimeout(() => onChange({ q: value }), 300)
  }

  // Price range is local while dragging; committed on release.
  const [range, setRange] = useState<[number, number]>([minPrice, maxPrice])
  useEffect(() => setRange([minPrice, maxPrice]), [minPrice, maxPrice])

  const hasPriceControl = bounds.max > bounds.min
  const priceActive = minPrice > bounds.min || maxPrice < bounds.max

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
          aria-label="Search products"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={sort}
          onValueChange={(value) => onChange({ sort: value as ProductSort })}
        >
          <SelectTrigger className="w-[170px]" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasPriceControl ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(priceActive && "border-primary text-primary")}
                aria-label="Filter by price"
              >
                <SlidersHorizontal />
                Price
                {priceActive ? (
                  <span className="ml-0.5 size-1.5 rounded-full bg-primary" />
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Price range</span>
                {priceActive ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      onChange({ minPrice: bounds.min, maxPrice: bounds.max })
                    }
                  >
                    <X />
                    Reset
                  </Button>
                ) : null}
              </div>
              <Slider
                min={bounds.min}
                max={bounds.max}
                step={1}
                value={range}
                onValueChange={(value) =>
                  setRange([value[0] ?? bounds.min, value[1] ?? bounds.max])
                }
                onValueCommit={(value) =>
                  onChange({ minPrice: value[0], maxPrice: value[1] })
                }
                className="my-3"
                aria-label="Price range"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatPrice(range[0])}</span>
                <span>{formatPrice(range[1])}</span>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  )
}
