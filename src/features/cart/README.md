# Cart Feature (Business Package)

This folder is a stub. The cart feature is disabled in Starter (`features.cart = false`).

## To enable for Business

1. Set `cart: true` in `src/app/config/features.ts`
2. Follow the step-by-step guide in `docs/ADDING_A_FEATURE.md`
3. Implement `CartRepository` interface in `src/services/interfaces/CartRepository.ts`

## What goes here

- `components/` — CartDrawer, CartItem, CartBadge, CartSummary
- `hooks/` — useCart.ts
- `types.ts` — CartItem, CartSummary Zod schemas + inferred types
- `index.ts` — public API (useCart, CartDrawer, CartBadge only)
- `__tests__/` — useCart.test.ts, CartDrawer.test.tsx
