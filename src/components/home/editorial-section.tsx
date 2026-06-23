const specs = [
  { label: "Materials", value: "100% natural" },
  { label: "Guarantee", value: "Lifetime" },
  { label: "Shipping", value: "Free $75+" },
  { label: "Returns", value: "30 days" },
]

export function EditorialSection() {
  return (
    <section className="bg-background">
      {/* Specs Grid */}
      <div className="grid grid-cols-2 border-t border-border md:grid-cols-4">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="border-b border-r border-border p-8 text-center last:border-r-0 md:border-b-0"
          >
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              {spec.label}
            </p>
            <p className="font-medium text-foreground text-4xl">{spec.value}</p>
          </div>
        ))}
      </div>

      {/* Full-width Video */}
      <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bcdafadc-cb7e-4cb7-9cbf-edcbaf2360a5_1-cNBCz5fomcLRmm1cTXSBOKCq10VP91.mp4"
        />
      </div>
    </section>
  )
}
