import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"

/**
 * Wishlist of saved product ids, persisted to localStorage. Same SSR-safe
 * pattern as the cart store (`lib/cart/store.ts`): `skipHydration` keeps the
 * server and first client render empty, then `rehydrateWishlist()` loads the
 * saved ids on mount and flips `hydrated`.
 *
 * Products are saved at the product level (by id), not per variant — the
 * customer picks a variant when moving an item to the cart.
 */

interface WishlistState {
  items: string[]
  hydrated: boolean
  toggle: (id: string) => void
  add: (id: string) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
  setHydrated: (value: boolean) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      toggle: (id) =>
        set((state) => ({
          items: state.items.includes(id)
            ? state.items.filter((i) => i !== id)
            : [...state.items, id],
        })),
      add: (id) =>
        set((state) =>
          state.items.includes(id) ? state : { items: [...state.items, id] }
        ),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i !== id) })),
      has: (id) => get().items.includes(id),
      clear: () => set({ items: [] }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "evergreen-wishlist-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

/** Load the persisted wishlist from localStorage. Safe to call on the client. */
export function rehydrateWishlist() {
  void useWishlistStore.persist.rehydrate()
}

export const useWishlistIds = () => useWishlistStore((s) => s.items)
export const useWishlistCount = () => useWishlistStore((s) => s.items.length)
export const useWishlistHydrated = () => useWishlistStore((s) => s.hydrated)
export const useIsWishlisted = (id: string) =>
  useWishlistStore((s) => s.items.includes(id))

export function useWishlistActions() {
  return useWishlistStore(
    useShallow((s) => ({
      toggle: s.toggle,
      add: s.add,
      remove: s.remove,
      clear: s.clear,
    }))
  )
}
