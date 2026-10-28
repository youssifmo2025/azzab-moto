# Backend Developer Handoff & Technical Requirements

> **Project:** AZZAB MOTO — E-Commerce (TVS Motorcycle Spare Parts)  
> **Backend Architecture:** REST API + MySQL + Session Authentication  
> **Related Documents:** `docs/API-CONTRACT.md`, `docs/openapi.yaml`, `docs/CLIENT-DECISIONS.md`

This document serves as the implementation agreement and architectural guidelines for the backend developer building the AZZAB MOTO API.

---

## 1. Core Principles & Business Invariants

### 1.1 Authoritative Calculations (Zero Trust in Frontend Values)
- **Prices and Totals:** The frontend submits only product IDs and requested quantities (`items: [{ productId, quantity }]`). The backend MUST fetch current prices from the database, compute subtotal, look up shipping fee (if applicable), and compute the grand total. Never accept prices or totals sent by the frontend client.
- **Stock Decrementing:** When an order is placed (`POST /api/orders`), the backend must wrap the availability check and stock decrement in an atomic database transaction (`SELECT ... FOR UPDATE` or equivalent). If stock is insufficient, roll back and return `409 Conflict` with code `OUT_OF_STOCK`.
- **Restoring Stock on Cancellation:** When an order status transitions to `cancelled` (from `new`, `processing`, or `shipped`), the backend must automatically and atomically restore the reserved quantities to product inventory if tracked (`stock_quantity IS NOT NULL`).

### 1.2 Soft Delete for Products (Preserving Order History)
- **Invariant:** Products must NEVER be hard-deleted from the database table (`DELETE FROM products`).
- Hard deletion violates foreign key integrity on historical orders and receipts (`order_items.product_id`).
- When an admin removes a product, execute a **soft delete** by setting `is_active = 0` (via `PATCH /api/admin/products/:id` with `{ isActive: false }`).
- Public catalog queries (`GET /api/products` and `GET /api/products/:slug`) must always filter with `WHERE is_active = 1`.
- Historical order receipts, admin orders list, and order details must join against products regardless of `is_active` status.

### 1.3 Category Deletion Invariant
- A category cannot be deleted if any products (whether active or soft-deleted) are linked to it. The backend must check `COUNT(*) FROM products WHERE category_id = :id` and return `409 Conflict` (`CATEGORY_NOT_EMPTY`) if count > 0.

### 1.4 Status Transitions
- Enforced order statuses: `new`, `processing`, `shipped`, `delivered`, `cancelled`.
- Allowed transitions:
  - `new` -> `processing`, `cancelled`
  - `processing` -> `shipped`, `cancelled`
  - `shipped` -> `delivered`, `cancelled`
  - `delivered` -> (Terminal; no further transitions allowed)
  - `cancelled` -> (Terminal; cannot be reopened)
- Transitioning from `delivered` to `cancelled` must return `400 Bad Request`.
- Status history entries must be recorded with timestamp, actor (`customer` or user ID), and optional note.

---

## 2. Role-Based Access Control (RBAC) Requirements

The system enforces 2 distinct staff roles:

### 2.1 Role: `admin` (Full Access)
- Can view, create, update, soft-delete products, and manage/reorder product images.
- Can view, create, update, reorder, and delete categories (subject to 409 check).
- Can view all orders, update status, and export CSVs.
- Can create staff accounts, disable/enable accounts, and reset staff passwords.

### 2.2 Role: `orders_manager` (Restricted Operator)
- **Forbidden Operations (MUST return 403 Forbidden):**
  - Cannot create, update, or delete products (`POST`, `PATCH`, `DELETE /api/admin/products*`).
  - Cannot upload, delete, or reorder images (`POST`, `DELETE`, `PUT /api/admin/products/:id/images*`).
  - Cannot create, update, reorder, or delete categories (`POST`, `PATCH`, `PUT`, `DELETE /api/admin/categories*`).
  - Cannot view or manage user accounts (`GET`, `POST`, `PATCH /api/admin/users*`).
  - Cannot export CSV (`GET /api/admin/orders/export/csv`).
- **Allowed Operations:**
  - Read-only access to products catalog with stock levels (`GET /api/admin/products`, `GET /api/admin/products/:id`).
  - Read-only access to categories (`GET /api/admin/categories`).
  - Full access to dashboard KPIs (`GET /api/admin/dashboard`).
  - Full access to orders list and order details (`GET /api/admin/orders`, `GET /api/admin/orders/:id`).
  - Update order status and append internal notes (`PATCH /api/admin/orders/:id/status`).

---

## 3. Security & Hardening Checklist

### 3.1 Authentication & Sessions
- **Session Mechanism:** Use secure, HTTP-only session cookies. No JWTs stored in client storage.
- **Cookie Attributes:**
  - `HttpOnly: true` (prevents XSS reading session)
  - `Secure: true` (HTTPS only; false only in local HTTP dev)
  - `SameSite: Lax`
  - `Path: /`
- **Session Expiry:** Inactive timeout: 4 hours. Absolute timeout: 24 hours.
- **Temporary Password Flag:** New users created via `POST /api/admin/users` or reset via `POST /api/admin/users/:id/reset-password` must be assigned a temporary password with `must_change_password = 1`. The login response returns `user.mustChangePassword: true`, and the client forces the user to `/admin/change-password` before granting dashboard access.

### 3.2 CSRF Protection
- Implement CSRF protection for all mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- Provide `GET /api/auth/csrf-token` which generates and returns a token and sets a matching cookie.
- The client reads the cookie or payload and returns `X-CSRF-Token` header.

### 3.3 Rate Limiting & Abuse Prevention
- `POST /api/auth/login`: Max 5 failed attempts per 15 minutes per IP. Return `429 Too Many Requests` with `Retry-After: <seconds>` header.
- `POST /api/orders`: Max 10 orders per hour per IP. Require `Idempotency-Key` header (UUID v4) stored with a 24-hour TTL in cache/database to prevent accidental double-submits.
- **Honeypot:** `POST /api/orders` accepts `honeypotField`. If non-empty, silently respond with 200 or 400 without creating an order to defeat dumb scrapers.
- `POST /api/orders/lookup`: Max 10 lookups per minute per IP. **Must accept JSON body `{ orderNumber, phone }` (not query params) to avoid exposing phone numbers in access logs.** Always respond with generic 404 message ("رقم الطلب أو رقم الهاتف غير مطابق لبيانات مسجلة لدينا") to avoid brute-forcing phone or order numbers.

### 3.4 File Uploads & Product Images
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- **Magic Bytes Validation:** Verify actual file signatures (magic bytes), do not rely solely on `Content-Type` header or file extension.
- Maximum file size: 5 MB per image.
- Resize/compress to WebP where possible, and serve via an asset CDN or protected static path. Avoid directory traversal by generating UUID-based filenames.

### 3.5 CSV Export Safety (Formula Injection)
- When generating CSVs in `GET /api/admin/orders/export/csv`, prepend a single quote (`'`) or tab before any cell starting with `=`, `+`, `-`, or `@` to neutralize spreadsheet formula injection vulnerabilities.
- Prepend UTF-8 BOM (`\uFEFF`) so Excel on Windows properly opens Arabic characters without mojibake.

### 3.6 CORS Configuration
- Whitelist allowed origins explicitly (e.g. `https://azzabmoto.com`, `http://localhost:5173`).
- Set `Access-Control-Allow-Credentials: true`.
- Never use wildcard `Access-Control-Allow-Origin: *` in combination with credentials.

---

## 4. Prerendering & Cache Invalidation

- The AZZAB MOTO frontend uses a build-time prerenderer (`scripts/prerender.mjs`) to generate static HTML pages for SEO and immediate first-paint.
- When products or categories are modified in the admin dashboard, existing prerendered HTML pages will remain stale until a rebuild occurs.
- **Proposed Solution:** Provide a backend webhook or integration with the frontend hosting provider (Vercel / Netlify / Cloudflare Pages) that triggers a rebuild when significant product or category updates occur (e.g., debounced 10 minutes or manual "إعادة نشر الموقع" button in the admin dashboard).

---

## 5. Open Questions for Client / Backend Alignment

Please review `docs/CLIENT-DECISIONS.md`:
1. **OQ-001:** Return / refund status logic. If the client decides to add "returned", backend will need a migration and stock restoration logic.
2. **OQ-002:** Shipping fees per governorate vs flat fee.
3. **OQ-006:** Inventory tracking mode (untracked vs tracked quantities).
4. **OQ-008:** CSV Export role scope (`admin` only vs `orders_manager` access).

---

## 6. Verification Checklist for Backend Launch

- [ ] All decimal money fields formatted as string `"0.00"`
- [ ] Atomic transactions for order creation with stock lock
- [ ] Invariant: stock restores on order cancellation
- [ ] Invariant: soft-delete products (`is_active = 0`), no hard deletes
- [ ] Invariant: block category deletion if products exist (409 Conflict)
- [ ] Role enforcement: deny product/category writes to `orders_manager` (403 Forbidden)
- [ ] Forced password change on first login for temporary passwords (`must_change_password`)
- [ ] HTTP-only, Secure session cookies with SameSite
- [ ] CSRF token verification on all state-changing admin routes
- [ ] POST /api/orders/lookup with generic 404 error message
- [ ] CSV formula injection protection + UTF-8 BOM
- [ ] Idempotency-Key support on POST /api/orders
- [ ] Standardized error response `{ code, message, fieldErrors? }`
