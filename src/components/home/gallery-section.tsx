import { useEffect, useRef, useState, useCallback } from "react"
import Image from "@/components/home/image"

export function GallerySection() {
  const galleryRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [sectionHeight, setSectionHeight] = useState("100vh")
  const [translateX, setTranslateX] = useState(0)
  const rafRef = useRef<number | null>(null)

  const images = [
    {
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
      alt: "Misty mountain valley",
    },
    {
      src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop",
      alt: "Folded apparel and textiles",
    },
    {
      src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop",
      alt: "Outdoor gear on the trail",
    },
    {
      src: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200&auto=format&fit=crop",
      alt: "Goods for the home",
    },
    {
      src: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
      alt: "Everyday accessories",
    },
    {
      src: "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=1200&auto=format&fit=crop",
      alt: "Deep forest light",
    },
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop",
      alt: "Alpine ridge at dawn",
    },
    {
      src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=1200&auto=format&fit=crop",
      alt: "Lakeside camp",
    },
  ]

  // Calculate section height based on content width
  useEffect(() => {
    const calculateHeight = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.scrollWidth
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const totalHeight = viewportHeight + (containerWidth - viewportWidth)
      setSectionHeight(`${totalHeight}px`)
    }

    const timer = setTimeout(calculateHeight, 100)
    window.addEventListener("resize", calculateHeight)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", calculateHeight)
    }
  }, [])

  const updateTransform = useCallback(() => {
    if (!galleryRef.current || !containerRef.current) return

    const rect = galleryRef.current.getBoundingClientRect()
    const containerWidth = containerRef.current.scrollWidth
    const viewportWidth = window.innerWidth

    const totalScrollDistance = containerWidth - viewportWidth
    const scrolled = Math.max(0, -rect.top)
    const progress = Math.min(1, scrolled / totalScrollDistance)
    const newTranslateX = progress * -totalScrollDistance

    setTranslateX(newTranslateX)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(updateTransform)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    updateTransform()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [updateTransform])

  return (
    <section
      id="gallery"
      ref={galleryRef}
      className="relative bg-background"
      style={{ height: sectionHeight }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full items-center">
          {/* Horizontal scrolling container */}
          <div
            ref={containerRef}
            className="flex gap-6 px-6"
            style={{
              transform: `translate3d(${translateX}px, 0, 0)`,
              WebkitTransform: `translate3d(${translateX}px, 0, 0)`,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              perspective: 1000,
              WebkitPerspective: 1000,
              touchAction: "pan-y",
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="relative h-[70vh] w-[85vw] flex-shrink-0 overflow-hidden rounded-2xl md:w-[60vw] lg:w-[45vw]"
                style={{
                  transform: "translateZ(0)",
                  WebkitTransform: "translateZ(0)",
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index < 3}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
