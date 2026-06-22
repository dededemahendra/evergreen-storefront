import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, Leaf, RotateCcw, ShieldCheck, Truck } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { ProductGrid } from "@/components/product/product-grid"
import { getCategories, getFeaturedProducts } from "@/lib/shop/data"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  loader: async () => {
    const [featured, categories] = await Promise.all([
      getFeaturedProducts(),
      getCategories(),
    ])
    return { featured, categories }
  },
  component: Home,
})

const valueProps = [
  { icon: Truck, title: "Free shipping over $75", body: "On all U.S. orders." },
  { icon: RotateCcw, title: "30-day returns", body: "No questions asked." },
  { icon: ShieldCheck, title: "Lifetime guarantee", body: "Built to last." },
]

function Home() {
  const { featured, categories } = Route.useLoaderData()

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto grid items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Leaf className="size-3.5 text-primary" />
              New season, new essentials
            </span>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              {siteConfig.tagline}
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className={cn(buttonVariants({ size: "lg" }), "h-11")}
              >
                Shop all products
                <ArrowRight />
              </Link>
              <Link
                to="/products"
                search={{ category: "outdoor" }}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11"
                )}
              >
                Explore outdoor
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-foreground/10">
            <img
              src="https://picsum.photos/seed/evergreen-hero/1200/900"
              alt="Featured collection"
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/products"
              search={{ category: category.slug }}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl p-4 ring-1 ring-foreground/10"
            >
              <img
                src={`https://picsum.photos/seed/cat-${category.slug}/600/450`}
                alt={category.title}
                className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="relative font-heading text-lg font-medium text-white">
                {category.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-heading text-2xl font-semibold">Featured</h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* Value props */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 rounded-2xl border bg-muted/30 p-8 sm:grid-cols-3">
          {valueProps.map((prop) => (
            <div key={prop.title} className="flex items-start gap-3">
              <prop.icon className="size-6 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{prop.title}</p>
                <p className="text-sm text-muted-foreground">{prop.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
