import { FadeImage } from "@/components/home/fade-image"

const accessories = [
  {
    id: 1,
    name: "Waxed Canvas Tote",
    description: "Hard-wearing everyday carryall",
    price: "$68",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Merino Wool Throw",
    description: "Soft, warm, naturally temperature-regulating",
    price: "$120",
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Stoneware Mug Set",
    description: "Hand-glazed, set of four",
    price: "$54",
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Insulated Trail Bottle",
    description: "Stainless steel, keeps cold 24h, 0.75L",
    price: "$38",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Enamel Camp Mug",
    description: "Chip-resistant, trail-ready",
    price: "$24",
    image:
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Packable Field Blanket",
    description: "Wool blend, water-resistant backing",
    price: "$95",
    image:
      "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=1000&auto=format&fit=crop",
  },
]

export function CollectionSection() {
  return (
    <section id="accessories" className="bg-background">
      {/* Section Title */}
      <div className="px-6 py-20 md:px-12 lg:px-20 md:py-10">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          The Essentials
        </h2>
      </div>

      {/* Accessories Grid/Carousel */}
      <div className="pb-24">
        {/* Mobile: Horizontal Carousel */}
        <div className="flex gap-6 overflow-x-auto px-6 pb-4 md:hidden snap-x snap-mandatory scrollbar-hide">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="group flex-shrink-0 w-[75vw] snap-center">
              {/* Image */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary">
                <FadeImage
                  src={accessory.image}
                  alt={accessory.name}
                  fill
                  className="object-cover group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium leading-snug text-foreground">
                      {accessory.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {accessory.description}
                    </p>
                  </div>
                  <span className="text-lg font-medium text-foreground">
                    {accessory.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 md:px-12 lg:px-20">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="group">
              {/* Image */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary">
                <FadeImage
                  src={accessory.image}
                  alt={accessory.name}
                  fill
                  className="object-cover group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium leading-snug text-foreground">
                      {accessory.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {accessory.description}
                    </p>
                  </div>
                  <span className="font-medium text-foreground text-2xl">
                    {accessory.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
