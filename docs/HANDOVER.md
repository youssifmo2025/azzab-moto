# AZZAB MOTO — Frontend Handover Document

> **Branch:** `feature/orders-admin-frontend`  
> **Generated:** 2026-10-28  
> **Status:** Steps 1–4 complete and committed. Step 5 (hardening + docs) in progress.

---

## Quick Start

```bash
# Install dependencies (already done)
npm install

# Development server with mock data (MSW)
npm run dev

# Production build (no MSW code)
npm run build

# Demo build (MSW enabled, data persists in localStorage)
npm run build:demo

# Run all tests
npm test

# Typecheck
npm run typecheck

# Lint
npm run lint
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Production | Base URL for the backend API (e.g., `https://api.azzabmoto.com`) |
| `VITE_DATA_SOURCE` | Optional | Set to `api` to use real API; omit or `json` to use static JSON mock |
| `VITE_DEMO_MODE` | Demo only | Set to `true` to enable MSW + localStorage demo persistence |

**Switch to real backend:**
```bash
# .env.local (never commit)
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=https://api.azzabmoto.com
```

See [`.env.example`](.env.example) for all placeholders.

---

## Demo Mode

The demo build (`npm run build:demo`) enables:
- **MSW (Mock Service Worker)** — intercepts all `/api/*` requests
- **Shared mock store** — orders created in checkout appear in the admin, status changes appear in `/track`
- **localStorage persistence** under keys `am_demo_orders_v1` and `am_demo_products_v1`
- **"نسخة تجريبية" banner** in the admin header with a reset button
- **No MSW code ships in production** — verified via `grep` on `dist/`

### Demo Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin12345` | Full admin (products, categories, users, CSV, images) |
| `manager` | `manager12345` | Orders manager (view products/categories, manage orders + status only) |

---

## Feature Flags

All new features are controlled by [`src/app/config/features.ts`](src/app/config/features.ts):

| Flag | Status | Description |
|---|---|---|
| `cart` | ✅ Enabled | Cart context, drawer, CartPage |
| `checkout` | ✅ Enabled | CheckoutPage route |
| `checkoutCod` | ✅ Enabled | Cash-on-delivery payment method |
| `orderTracking` | ✅ Enabled | `/track` page |
| `orderLookup` | ✅ Enabled | POST `/api/orders/lookup` |
| `accounts` | ❌ Disabled | Customer accounts (future scope) |

---

## Routes

### Public Routes

| Path | Component | Notes |
|---|---|---|
| `/` | `HomePage` | Prerendered |
| `/catalog` | `CatalogPage` | Prerendered (38 pages) |
| `/catalog/:slug` | `CategoryPage` | Prerendered |
| `/products/:slug` | `ProductPage` | Prerendered; Add to Cart button |
| `/search` | `SearchPage` | |
| `/cart` | `CartPage` | Lazy-loaded |
| `/checkout` | `CheckoutPage` | Lazy-loaded; COD only |
| `/order/confirmation` | `OrderConfirmationPage` | Post-checkout |
| `/track` | `OrderTrackingPage` | POST lookup, generic errors |
| `/about`, `/contact`, etc. | Static pages | Prerendered |

### Admin Routes (lazy-loaded, noindex, excluded from sitemap/SW/prerender)

| Path | Role | Notes |
|---|---|---|
| `/admin/login` | Public | Login form + CSRF fetch |
| `/admin` | Both | Redirect to dashboard |
| `/admin/dashboard` | Both | Stats, today's orders, polling |
| `/admin/orders` | Both | List, filter, search, pagination |
| `/admin/orders/:id` | Both | Detail, history, note, transitions, print |
| `/admin/products` | Both | List (view/soft-delete=admin only) |
| `/admin/products/new` | Admin only | Create product |
| `/admin/products/:id/edit` | Admin only | Edit, images, stock |
| `/admin/categories` | Both | List (CRUD=admin only) |
| `/admin/users` | Admin only | Create, disable, enable, reset password |
| `/admin/change-password` | Both | Forced on `mustChangePassword=true` |

---

## Security Checklist

- [x] **No tokens in localStorage** — Auth uses HttpOnly cookies (`credentials: 'include'`)
- [x] **No PII after checkout** — `storage.lastOrder` only stores `{ orderNumber, createdAt }`
- [x] **CSRF header on mutations** — `X-CSRF-Token` sent on POST/PATCH/PUT/DELETE
- [x] **All `_blank` links have `rel="noopener noreferrer"`** — verified by `scripts/scan-blank.mjs`
- [x] **No `dangerouslySetInnerHTML`, `eval`, or `new Function`** — enforced in lint + code review
- [x] **CSP updated** — `connect-src` allows `https://api.azzabmoto.com` in both `_headers` and `vercel.json`
- [x] **No MSW in production** — tree-shaken; verified by `grep msw dist/` returning empty
- [x] **Admin routes excluded** — from prerender, sitemap, SW precache, and `robots.txt` (`Disallow: /admin`)
- [x] **Frontend is defense-in-depth only** — all authoritative checks (price, stock, roles) are on the backend

---

## API Integration

See [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md) and [`docs/openapi.yaml`](docs/openapi.yaml) for the full contract.

**Key points for the backend developer:**
- All admin state-changing endpoints require `X-CSRF-Token` header
- POST `/api/orders` accepts `Idempotency-Key` header (UUID v4) for deduplication
- POST `/api/orders/lookup` uses a JSON body (never query params) to keep PII out of logs
- `orders_manager` role: read-only on products/categories, read + status update on orders
- `admin` role: full access including users, CSV export, image management
- Product deletes are soft (`PATCH isActive: false`) — order snapshots remain intact
- `mustChangePassword: true` forces the change-password screen before any admin action

---

## Architecture

```
src/
├── admin/                    # Admin dashboard (lazy-loaded chunk)
│   ├── context/AdminAuthContext.tsx
│   ├── components/AdminLayout.tsx
│   └── pages/                # Login, Dashboard, Orders, Products, Categories, Users, ChangePassword
├── app/
│   ├── config/
│   │   ├── features.ts       # Feature flags
│   │   ├── site.ts           # Site config
│   │   └── shipping.ts       # Governorates + shipping fees
│   ├── layouts/              # Header (with CartIcon), Footer, MainLayout
│   └── router/AppRouter.tsx  # Route definitions
├── features/
│   ├── cart/                 # CartContext, CartIcon, CartDrawer, CartPage
│   ├── checkout/             # CheckoutPage, OrderConfirmationPage
│   ├── order-tracking/       # OrderTrackingPage
│   ├── product/              # ProductPage (with Add to Cart)
│   └── catalog/              # CatalogPage, ProductCard (with Add to Cart)
├── services/
│   ├── api/
│   │   ├── client.ts         # ApiClient with CSRF, timeout, Zod validation
│   │   └── schemas/          # Zod schemas for all API types
│   ├── mock/
│   │   ├── handlers/         # MSW handlers (orders, admin, auth)
│   │   └── data/mock-data.ts # Shared mock store + demo persistence
│   └── index.ts              # Repository factory (JSON vs API)
└── shared/
    └── lib/storage.ts        # Typed localStorage wrapper (no PII)
```

---

## Known Limitations & Open Questions

1. **Shipping fees** — all set to `0` by default. The client must provide actual rates per governorate. See [`src/app/config/shipping.ts`](src/app/config/shipping.ts).

2. **Returned order status** — not implemented. Open question in [`docs/CLIENT-DECISIONS.md`](docs/CLIENT-DECISIONS.md) regarding stock restoration.

3. **CSV export role** — currently admin-only in MSW. Open question in CLIENT-DECISIONS.md.

4. **Prerendered pages** — admin edits don't appear in static pages until `npm run build` is re-run. A rebuild webhook is recommended — see [`docs/BACKEND-HANDOFF.md`](docs/BACKEND-HANDOFF.md).

5. **oxlint `set-state-in-effect` warnings** — 12 warnings, pre-existing pattern, acceptable. Not errors.

6. **Images** — no real product images; `img-src 'self' data: https:` is allowed in CSP for product images served from the backend.

---

## Bundle Size (vs Baseline)

| | Baseline (`79efc98`) | Step 4 Production |
|---|---|---|
| `index.js` (gzip) | 132.53 kB | 122.50 kB |
| `jsx-runtime` (gzip) | — | 8.85 kB |
| **Total entry** | **132.53 kB** | **~131.35 kB** |

Admin, cart, checkout, and order-tracking chunks are lazy-loaded and NOT included in the entry bundle.

---

## 10-Minute Manual Test Checklist

### Public Flow
- [ ] Home page loads with Arabic RTL, no console errors
- [ ] Browse catalog, click a product — Add to Cart button visible
- [ ] Cart icon in header shows badge count + pulse animation
- [ ] Cart drawer opens, shows items, can change quantity and remove
- [ ] Proceed to checkout — form with governorate select, phone validation
- [ ] Submit order → Confirmation page shows order number + "تابع طلبك" button
- [ ] Click "تابع طلبك" → track page pre-filled, shows status timeline
- [ ] Track page: enter wrong phone → generic "لا يوجد طلب بهذه البيانات" error
- [ ] Footer and header have "تتبع الطلب" link

### Admin Flow (demo build or `npm run dev`)
- [ ] `/admin` redirects to `/admin/login`
- [ ] Login with `admin` / `admin12345` → dashboard shows order stats
- [ ] Orders list: filter by status, search by order number
- [ ] Open order detail: update status (new → processing → shipped → delivered)
- [ ] Cancel an order before "delivered" — confirm it's disallowed after delivered
- [ ] Products: soft delete a product (isActive toggle)
- [ ] Categories: create a new category, reorder
- [ ] Users (admin only): create user with temp password (shown once)
- [ ] Logout → redirected to login
- [ ] Login with `manager` / `manager12345` → Users menu not visible
- [ ] Demo: place a new order in checkout → appears in admin orders list
