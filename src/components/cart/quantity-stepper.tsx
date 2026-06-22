import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "default",
  className,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: "default" | "sm"
  className?: string
}) {
  const buttonSize = size === "sm" ? "icon-sm" : "icon"

  return (
    <div
      className={cn("inline-flex items-center rounded-lg border", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <span className="w-8 text-center text-sm tabular-nums">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  )
}
