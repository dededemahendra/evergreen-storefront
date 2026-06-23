import { useEffect, useRef, useState } from "react"
import type { ComponentProps } from "react"
import Image from "@/components/home/image"

type FadeImageProps = ComponentProps<typeof Image> & {
  fadeDelay?: number
}

export function FadeImage({
  className,
  fadeDelay = 0,
  ...props
}: FadeImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, fadeDelay)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [fadeDelay])

  useEffect(() => {
    // In SSR the <img> can finish loading before React hydrates and attaches
    // `onLoad`, so the event never fires and the image stays hidden. Detect an
    // already-complete (cached / server-rendered) image on mount.
    const img = ref.current?.querySelector("img")
    if (img?.complete && img.naturalWidth > 0) setIsLoaded(true)
  }, [])

  return (
    <div ref={ref} className="relative h-full w-full">
      <Image
        {...props}
        className={`${className || ""} transition-all duration-700 ease-out ${
          isVisible && isLoaded
            ? "scale-100 opacity-100"
            : "scale-[1.02] opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}
