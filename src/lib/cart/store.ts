import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"
import { computeTotals } from "@/lib/shop/pricing"
import type { CartItem } from "@/lib/shop/types"

/**
 * Client-side cart, persisted to localStorage.
 *
 * SSR safety: `skipHydration` keeps localStorage untouched on the server and on
 * the first client render (so server HTML and first client paint both show an
 * empty cart — no hydration mismatch). `rehydrateCart()` is called once on mount
 * (see the root route) to load the persisted cart; `hydrated` flips true when
 * that completes so UI can show a skeleton until then.
 */

export type NewCartItem = Omit<CartItem, "quantity">

/**
 * Stable identity for a cart line. Keyed on product + variant so two different
 * products that happen to share a variant id (e.g. a reused SKU from Sanity)
 * never merge into the same line.
 */
export const lineKey = (item: { productId: string; variantId: string }) =>
  `${item.productId}::${item.variantId}`

interface CartState {
  items: CartItem[]
  hydrated: boolean
  addItem: (item: NewCartItem, quantity?: number) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clear: () => void
  setHydrated: (value: boolean) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const key = lineKey(item)
          const existing = state.items.find((i) => lineKey(i) === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                lineKey(i) === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => lineKey(i) !== key),
        })),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => lineKey(i) !== key)
              : state.items.map((i) =>
                  lineKey(i) === key ? { ...i, quantity } : i
                ),
        })),
      clear: () => set({ items: [] }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "evergreen-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

/** Trigger a one-time rehydrate from localStorage. Safe to call on the client. */
export function rehydrateCart() {
  void useCartStore.persist.rehydrate()
}

// --- Selector hooks (subscribe to just what each component needs) ---

export const useCartItems = () => useCartStore((s) => s.items)
export const useCartHydrated = () => useCartStore((s) => s.hydrated)
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))

export function useCartActions() {
  return useCartStore(
    useShallow((s) => ({
      addItem: s.addItem,
      removeItem: s.removeItem,
      updateQuantity: s.updateQuantity,
      clear: s.clear,
    }))
  )
}

/** Derived order totals for the current cart. */
export function useCartTotals() {
  const items = useCartItems()
  return computeTotals(items)
}
