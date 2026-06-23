import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

/**
 * Share the current product. Uses the Web Share API (native share sheet) where
 * available, falling back to copying the link to the clipboard with a toast.
 * Both browser APIs only run on click, so this is SSR-safe.
 */
export function ShareButton({
  title,
  text,
  className,
}: {
  title: string
  text?: string
  className?: string
}) {
  async function handleShare() {
    const url = window.location.href

    // Feature-detect at runtime ("share" is absent on many desktop browsers,
    // even though the DOM types declare it as always present).
    if ("share" in navigator) {
      try {
        await navigator.share({ title, text: text ?? title, url })
        return
      } catch (error) {
        // User dismissed the share sheet — leave it; any other error falls
        // through to the copy-link fallback below.
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Couldn't copy the link")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleShare()}
      aria-label={`Share ${title}`}
      className={className}
    >
      <Share2 />
      Share
    </Button>
  )
}
