import { beforeEach, describe, expect, it, vi } from "vitest"

// Polyfill localStorage before the store module loads, so the persist
// middleware's setItem/getItem work in the Node test environment.
vi.hoisted(() => {
  const data = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    removeItem: (key) => {
      data.delete(key)
    },
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
  globalThis.localStorage = storage
})

const { useWishlistStore } = await import("./store")

const ids = () => useWishlistStore.getState().items
const api = () => useWishlistStore.getState()

beforeEach(() => useWishlistStore.setState({ items: [] }))

describe("wishlist store", () => {
  it("adds an item and dedupes repeats", () => {
    api().add("a")
    api().add("a")
    expect(ids()).toEqual(["a"])
  })

  it("toggles an item on and off", () => {
    api().toggle("a")
    expect(ids()).toEqual(["a"])
    api().toggle("a")
    expect(ids()).toEqual([])
  })

  it("removes an item", () => {
    useWishlistStore.setState({ items: ["a", "b"] })
    api().remove("a")
    expect(ids()).toEqual(["b"])
  })

  it("reports membership via has()", () => {
    useWishlistStore.setState({ items: ["a"] })
    expect(api().has("a")).toBe(true)
    expect(api().has("b")).toBe(false)
  })

  it("clears all items", () => {
    useWishlistStore.setState({ items: ["a", "b"] })
    api().clear()
    expect(ids()).toEqual([])
  })
})
