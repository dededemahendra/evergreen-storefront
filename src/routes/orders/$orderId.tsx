import { createFileRoute, Link } from "@tanstack/react-router"
import { CircleCheck, PackageX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { lineKey } from "@/lib/cart/store"
import { getOrderById } from "@/lib/orders/data"
import { imageOrPlaceholder } from "@/lib/shop/images"
import { formatPrice } from "@/lib/shop/pricing"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/orders/$orderId")({
  loader: async ({ params }) => {
    const order = await getOrderById({ data: params.orderId })
    return { order }
  },
  component: OrderPage,
})

function OrderPage() {
  const { order } = Route.useLoaderData()
  const { orderId } = Route.useParams()

  if (!order) {
    return (
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-24 text-center">
        <PackageX className="size-12 text-muted-foreground/40" />
        <h1 className="font-heading text-2xl font-semibold">Order not found</h1>
        <p className="max-w-md text-muted-foreground">
          We couldn't find an order with the id{" "}
          <span className="font-mono">{orderId}</span>. It may have expired in
          this demo's storage.
        </p>
        <Link to="/products" className={cn(buttonVariants(), "mt-2")}>
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <CircleCheck className="size-14 text-primary" />
        <h1 className="font-heading text-3xl font-semibold">
          Thank you for your order!
        </h1>
        <p className="text-muted-foreground">
          A confirmation has been sent to{" "}
          <span className="font-medium text-foreground">
            {order.customer.email}
          </span>
          .
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Order</span>
          <span className="font-mono font-medium">{order.id}</span>
          <Badge variant="secondary" className="capitalize">
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="mt-10 space-y-6 rounded-xl border p-6">
        <div>
          <h2 className="mb-3 font-medium">Items</h2>
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={lineKey(item)} className="flex items-center gap-3 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={imageOrPlaceholder(item.image)}
                    alt={item.title}
                    className="size-full object-cover"
                  />
                  <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="leading-tight font-medium">{item.title}</p>
                  {item.variantTitle !== "Default" ? (
                    <p className="text-xs text-muted-foreground">
                      {item.variantTitle}
                    </p>
                  ) : null}
                </div>
                <span className="text-sm">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <h2 className="mb-1 font-medium">Shipping to</h2>
            <p>
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-muted-foreground">{order.customer.address}</p>
            <p className="text-muted-foreground">
              {order.customer.city}, {order.customer.state}{" "}
              {order.customer.postalCode}
            </p>
            <p className="text-muted-foreground">{order.customer.country}</p>
          </div>

          <div className="space-y-2 text-sm">
            <h2 className="mb-1 font-medium">Summary</h2>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 ? (
              <div className="flex justify-between text-primary">
                <span>
                  Discount{order.discountCode ? ` (${order.discountCode})` : ""}
                </span>
                <span>−{formatPrice(order.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/products"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
