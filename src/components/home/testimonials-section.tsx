import Image from "@/components/home/image"

export function TestimonialsSection() {
  return (
    <section id="about" className="bg-background">
      {/* Large Text Statement */}
      <div className="px-6 py-24 md:px-12 md:py-32 lg:px-20 lg:py-40">
        <p className="mx-auto max-w-5xl text-2xl leading-relaxed text-foreground md:text-3xl lg:text-[2.5rem] lg:leading-snug">
          Evergreen brings together natural materials and honest craft — made for
          people who want fewer, better things that last, at home and outdoors.
        </p>
      </div>

      {/* About Image */}
      <div className="relative aspect-[16/9] w-full">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop"
          alt="Mountain peaks at sunrise"
          fill
          className="object-cover"
        />
        {/* Fade gradient overlay - background at bottom fading to transparent at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
    </section>
  )
}
