import { FadeImage } from "@/components/home/fade-image"

const features = [
  {
    title: "Built to Last a Lifetime",
    description: "Durability",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Natural, Honest Materials",
    description: "Materials",
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Thoughtfully Designed",
    description: "Craft",
    image:
      "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Free Shipping Over $75",
    description: "Service",
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Lifetime Guarantee",
    description: "Guarantee",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Responsibly Sourced",
    description: "Sourcing",
    image:
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1000&auto=format&fit=crop",
  },
]

export function FeaturedProductsSection() {
  return (
    <section id="technology" className="bg-background">
      {/* Section Title */}
      <div className="px-6 py-20 text-center md:px-12 md:py-28 lg:px-20 lg:py-32 lg:pb-20">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Built to Last.
          <br />
          Made to Be Lived In.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">
          Why Evergreen
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-4 px-6 pb-20 md:grid-cols-3 md:px-12 lg:px-20">
        {features.map((feature) => (
          <div key={feature.title} className="group">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <FadeImage
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="py-6">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                {feature.description}
              </p>
              <h3 className="text-foreground text-xl font-semibold">
                {feature.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
