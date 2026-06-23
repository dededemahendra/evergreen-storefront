import { createFileRoute } from "@tanstack/react-router"
import { Header } from "@/components/home/header"
import { HeroSection } from "@/components/home/hero-section"
import { PhilosophySection } from "@/components/home/philosophy-section"
import { FeaturedProductsSection } from "@/components/home/featured-products-section"
import { TechnologySection } from "@/components/home/technology-section"
import { GallerySection } from "@/components/home/gallery-section"
import { CollectionSection } from "@/components/home/collection-section"
import { EditorialSection } from "@/components/home/editorial-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <PhilosophySection />
      <FeaturedProductsSection />
      <TechnologySection />
      <GallerySection />
      <CollectionSection />
      <EditorialSection />
      <TestimonialsSection />
    </>
  )
}
