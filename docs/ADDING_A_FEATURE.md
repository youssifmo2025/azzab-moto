# AZZAB MOTO — Adding a Feature

> How to add **Cart** (Business) or **Garage** (Premium) without breaking Starter.

---

## The Golden Rule

**Never modify a working feature's internals to accommodate a new one.**  
Communicate across features only through their public `index.ts`.

---

## Step-by-Step: Adding Cart (Business Example)

### 1. Enable the flag

```ts
// src/app/config/features.ts
export const features = {
  cart: true,   // ← was false
  ...
} as const
```

### 2. Add Zod schema and types

```ts
// src/features/cart/types.ts
import { z } from 'zod'

export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
  addedAt: z.number(), // unix timestamp
})
export type CartItem = z.infer<typeof CartItemSchema>
```

### 3. Implement storage

Use `src/shared/lib/storage.ts` pattern to safely persist the cart:

```ts
// src/features/cart/storage.ts
import { z } from 'zod'
import { readStorage, writeStorage, buildStorageKey } from '@/shared/lib/storage'
import { CartItemSchema, type CartItem } from './types'

const CART_KEY = buildStorageKey('cart_v1')
const CartArraySchema = z.array(CartItemSchema)

export const cartStorage = {
  get: (): CartItem[] => readStorage(CART_KEY, CartArraySchema, []),
  set: (items: CartItem[]): boolean => writeStorage(CART_KEY, items),
  clear: (): boolean => writeStorage(CART_KEY, []),
}
```

### 4. Add repository interface (if server-side cart)

```ts
// src/services/interfaces/CartRepository.ts
export interface CartRepository {
  getItems(sessionId: string): Promise<CartItem[]>
  addItem(sessionId: string, item: CartItem): Promise<void>
  removeItem(sessionId: string, productId: string): Promise<void>
}
```

### 5. Build the feature

```
src/features/cart/
  components/
    CartDrawer.tsx
    CartItem.tsx
    CartBadge.tsx
  hooks/
    useCart.ts
  types.ts
  index.ts    ← export only: useCart, CartDrawer, CartBadge
```

### 6. Wire into layout

```tsx
// src/app/layouts/MainLayout.tsx
import { features } from '@/app/config/features'
import { CartBadge } from '@/features/cart' // only if features.cart

// In the header:
{
  features.cart && <CartBadge />
}
```

### 7. Write tests

```
src/features/cart/
  __tests__/
    useCart.test.ts      # Add, remove, persist, quantity limits
    CartDrawer.test.tsx  # Render, accessibility, keyboard nav
```

### 8. Update docs

- `docs/DEPENDENCIES.md`: add any new packages
- `docs/SECURITY.md`: cart data in localStorage — add to threat model
- `docs/DATA_SCHEMA.md`: add CartItem schema

---

## Step-by-Step: Adding Garage (Premium Example)

Garage allows logged-in riders to save their motorcycles (e.g., "TVS Apache RTR 200 4V - 2022") so the entire store auto-filters to parts compatible with their garage vehicles.

Follow the same modular pattern:

### 1. Prerequisites & Flags

Garage requires **user accounts** (Business feature), so ensure both flags are enabled:

```ts
// src/app/config/features.ts
export const features = {
  ...
  accounts: true,
  garage: true,
} as const
```

### 2. Zod Schema

```ts
// src/features/garage/types.ts
import { z } from 'zod'

export const GarageVehicleSchema = z.object({
  id: z.string().uuid(),
  modelId: z.string().min(1),
  year: z.number().int().min(1990).max(2035),
  nickname: z.string().max(50).optional(),
  plateNumber: z.string().max(20).optional(),
  isPrimary: z.boolean().default(false),
})

export type GarageVehicle = z.infer<typeof GarageVehicleSchema>
```

### 3. Repository or API Integration

In Premium, user garage vehicles are synchronized to the backend profile API:

```ts
// src/features/garage/services/garage-repository.interface.ts
export interface GarageRepository {
  getVehicles(): Promise<GarageVehicle[]>
  addVehicle(vehicle: Omit<GarageVehicle, 'id'>): Promise<GarageVehicle>
  removeVehicle(id: string): Promise<void>
  setPrimary(id: string): Promise<void>
}
```

### 4. Structure & Public API

```
src/features/garage/
  components/
    GarageSelector.tsx      # Quick switcher in header
    AddVehicleModal.tsx     # Add bike by selecting TVS model + year
    VehicleCard.tsx
  hooks/
    useGarage.ts            # Active bike selection & compatibility filter sync
  types.ts
  index.ts                  # Public exports: useGarage, GarageSelector
```

### 5. Integration with Catalog Filter

`useGarage` hooks into the existing `useSearchParams` or `CatalogFilters`:

```tsx
// Inside CatalogPage or Header
import { GarageSelector } from '@/features/garage'

{
  features.garage && <GarageSelector />
}
```

---

## What NOT to Do

- ❌ Don't add cart logic to the `catalog` or `product` feature
- ❌ Don't import from a sibling feature's `components/` folder — use its `index.ts`
- ❌ Don't store PII (names, addresses) in localStorage — that requires encryption + backend
- ❌ Don't skip the Zod schema — all new data shapes must have runtime validation
