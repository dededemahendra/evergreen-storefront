import { useEffect, useRef, useState, useCallback } from "react"
import Image from "@/components/home/image"

export function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [alpineTranslateX, setAlpineTranslateX] = useState(-100)
  const [forestTranslateX, setForestTranslateX] = useState(100)
  const [titleOpacity, setTitleOpacity] = useState(1)
  const rafRef = useRef<number | null>(null)

  const updateTransforms = useCallback(() => {
    if (!sectionRef.current) return

    const rect = sectionRef.current.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const sectionHeight = sectionRef.current.offsetHeight

    // Calculate progress based on scroll position
    const scrollableRange = sectionHeight - windowHeight
    const scrolled = -rect.top
    const progress = Math.max(0, Math.min(1, scrolled / scrollableRange))

    // Field comes from left (-100% to 0%)
    setAlpineTranslateX((1 - progress) * -100)

    // Hearth comes from right (100% to 0%)
    setForestTranslateX((1 - progress) * 100)

    // Title fades out as blocks come together
    setTitleOpacity(1 - progress)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(updateTransforms)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    updateTransforms()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [updateTransforms])

  return (
    <section id="products" className="bg-background">
      {/* Scroll-Animated Product Grid */}
      <div ref={sectionRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <div className="relative w-full">
            {/* Title - positioned behind the blocks */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{ opacity: titleOpacity }}
            >
              <h2 className="text-[12vw] font-medium leading-[0.95] tracking-tighter text-foreground md:text-[10vw] lg:text-[8vw] text-center px-6">
                Meet Field &amp; Hearth.
              </h2>
            </div>

            {/* Product Grid */}
            <div className="relative z-10 grid grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-12 lg:px-20">
              {/* Field Image - comes from left */}
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{
                  transform: `translate3d(${alpineTranslateX}%, 0, 0)`,
                  WebkitTransform: `translate3d(${alpineTranslateX}%, 0, 0)`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop"
                  alt="Field collection — gear for the outdoors"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-6">
                  <span className="backdrop-blur-md px-4 py-2 text-sm font-medium rounded-full bg-[rgba(255,255,255,0.2)] text-white">
                    Field $145
                  </span>
                </div>
              </div>

              {/* Hearth Image - comes from right */}
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{
                  transform: `translate3d(${forestTranslateX}%, 0, 0)`,
                  WebkitTransform: `translate3d(${forestTranslateX}%, 0, 0)`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200&auto=format&fit=crop"
                  alt="Hearth collection — goods for the home"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-6">
                  <span className="backdrop-blur-md px-4 py-2 text-sm font-medium rounded-full bg-[rgba(255,255,255,0.2)] text-white">
                    Hearth $98
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-20 md:px-12 md:py-28 lg:px-20 lg:py-36 lg:pb-14">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            The flagship pair
          </p>
          <p className="mt-8 leading-relaxed text-muted-foreground text-3xl text-center">
            Field &amp; Hearth are everyday essentials designed for modern life — at
            home and on the trail. Durable, natural, and made to be used for years.
          </p>
        </div>
      </div>
    </section>
  )
}
