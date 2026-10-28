import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { storage, type CartItemStorage } from '@/shared/lib/storage'
import { activeProductRepository } from '@/services'
import type { Product } from '@/services/schemas/product'

export interface EnrichedCartItem {
  productId: string
  quantity: number
  product: Product | null
  savedPrice: string
  currentPrice: string
  isPriceChanged: boolean
  isUnavailable: boolean
}

export interface StaleNotification {
  productId: string
  productName: string
  reason: 'price_changed' | 'unavailable'
  oldPrice?: string
  newPrice?: string
}

interface CartContextValue {
  items: EnrichedCartItem[]
  itemCount: number
  subtotal: string
  subtotalNumber: number
  isLoading: boolean
  isDrawerOpen: boolean
  staleNotifications: StaleNotification[]
  setIsDrawerOpen: (open: boolean) => void
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  acknowledgeStaleItems: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [storedItems, setStoredItems] = useState<CartItemStorage[]>(() => storage.cart.get().items)
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  // Fetch product details for all stored cart items
  const syncWithInventory = useCallback(async (cartItems: CartItemStorage[]) => {
    if (cartItems.length === 0) {
      setProductsMap(new Map())
      setIsLoading(false)
      return
    }

    try {
      const allProducts = await activeProductRepository.getAll()
      const newMap = new Map<string, Product>()
      allProducts.forEach((p) => newMap.set(p.id, p))
      setProductsMap(newMap)
    } catch (err) {
      console.error('Failed to sync cart items with inventory', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void syncWithInventory(storedItems)
  }, [syncWithInventory, storedItems])

  // Save storedItems whenever they change
  const persistItems = useCallback((newItems: CartItemStorage[]) => {
    setStoredItems(newItems)
    storage.cart.set({ items: newItems })
  }, [])

  // Enriched items with stale checks
  const { enrichedItems, staleAlerts } = useMemo(() => {
    const enriched: EnrichedCartItem[] = []
    const alerts: StaleNotification[] = []

    for (const item of storedItems) {
      const product = productsMap.get(item.productId) ?? null
      const currentPrice = product ? product.price.toFixed(2) : item.savedPrice
      const isUnavailable = !product || !product.isActive || product.stockQuantity === 0
      const isPriceChanged = product ? currentPrice !== item.savedPrice : false

      enriched.push({
        productId: item.productId,
        quantity: item.quantity,
        product,
        savedPrice: item.savedPrice,
        currentPrice,
        isPriceChanged,
        isUnavailable,
      })

      if (!acknowledged) {
        if (isUnavailable) {
          alerts.push({
            productId: item.productId,
            productName: product ? product.name : 'منتج في سلتك',
            reason: 'unavailable',
          })
        } else if (isPriceChanged) {
          alerts.push({
            productId: item.productId,
            productName: product.name,
            reason: 'price_changed',
            oldPrice: item.savedPrice,
            newPrice: currentPrice,
          })
        }
      }
    }

    return { enrichedItems: enriched, staleAlerts: alerts }
  }, [storedItems, productsMap, acknowledged])

  const addItem = useCallback(
    (product: Product, quantity: number = 1) => {
      const currentPriceStr = product.price.toFixed(2)
      const existingIndex = storedItems.findIndex((i) => i.productId === product.id)
      let nextItems: CartItemStorage[]

      if (existingIndex >= 0) {
        nextItems = storedItems.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
                savedPrice: currentPriceStr,
              }
            : item,
        )
      } else {
        nextItems = [
          ...storedItems,
          {
            productId: product.id,
            quantity: Math.max(1, quantity),
            savedPrice: currentPriceStr,
          },
        ]
      }

      setProductsMap((prev) => {
        const updated = new Map(prev)
        updated.set(product.id, product)
        return updated
      })

      persistItems(nextItems)
      setIsDrawerOpen(true)
    },
    [storedItems, persistItems],
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        persistItems(storedItems.filter((i) => i.productId !== productId))
        return
      }

      const nextItems = storedItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      )
      persistItems(nextItems)
    },
    [storedItems, persistItems],
  )

  const removeItem = useCallback(
    (productId: string) => {
      persistItems(storedItems.filter((i) => i.productId !== productId))
    },
    [storedItems, persistItems],
  )

  const clearCart = useCallback(() => {
    persistItems([])
    setAcknowledged(false)
  }, [persistItems])

  const acknowledgeStaleItems = useCallback(() => {
    setAcknowledged(true)
    // Update savedPrice to currentPrice for all valid products
    const nextItems = storedItems.map((item) => {
      const product = productsMap.get(item.productId)
      return {
        ...item,
        savedPrice: product ? product.price.toFixed(2) : item.savedPrice,
      }
    })
    persistItems(nextItems)
  }, [storedItems, productsMap, persistItems])

  const itemCount = useMemo(
    () =>
      enrichedItems.reduce((acc, item) => (item.isUnavailable ? acc : acc + item.quantity), 0),
    [enrichedItems],
  )

  const subtotalNumber = useMemo(
    () =>
      enrichedItems.reduce((acc, item) => {
        if (item.isUnavailable) return acc
        return acc + parseFloat(item.currentPrice) * item.quantity
      }, 0),
    [enrichedItems],
  )

  const subtotal = subtotalNumber.toFixed(2)

  return (
    <CartContext.Provider
      value={{
        items: enrichedItems,
        itemCount,
        subtotal,
        subtotalNumber,
        isLoading,
        isDrawerOpen,
        staleNotifications: staleAlerts,
        setIsDrawerOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        acknowledgeStaleItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
