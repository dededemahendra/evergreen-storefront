import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

type ImageProps = Omit<ComponentPropsWithoutRef<"img">, "src" | "alt"> & {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
}

/**
 * Drop-in replacement for `next/image` so template sections port unchanged.
 * `fill` reproduces next/image's absolutely-positioned fill inside a
 * `relative` parent; `object-cover` comes from the section's className.
 */
export default function Image({
  src,
  alt,
  fill,
  priority,
  className,
  loading,
  ...props
}: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
      loading={loading ?? (priority ? "eager" : "lazy")}
      fetchPriority={priority ? "high" : undefined}
      {...props}
    />
  )
}
