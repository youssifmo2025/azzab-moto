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

### 1.2 Status Transitions
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

## 2. Security & Hardening Checklist

### 2.1 Authentication & Sessions
- **Session Mechanism:** Use secure, HTTP-only session cookies. No JWTs stored in client storage.
- **Cookie Attributes:**
  - `HttpOnly: true` (prevents XSS reading session)
  - `Secure: true` (HTTPS only; false only in local HTTP dev)
  - `SameSite: Lax` (or `Strict` for state-changing endpoints)
  - `Path: /`
- **Session Expiry:** Inactive timeout: 4 hours. Absolute timeout: 24 hours.

### 2.2 CSRF Protection
- Implement CSRF protection for all mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- Provide `GET /api/auth/csrf-token` which generates and returns a token and sets a matching cookie.
- The client reads the cookie or payload and returns `X-CSRF-Token` header.

### 2.3 Rate Limiting & Abuse Prevention
- `POST /api/auth/login`: Max 5 failures per 15 minutes per IP. Apply exponential backoff.
- `POST /api/orders`: Max 10 orders per hour per IP. Require `Idempotency-Key` header (UUID v4) stored with a 24-hour TTL in cache/database to prevent accidental double-submits.
- **Honeypot:** `POST /api/orders` accepts `honeypotField`. If non-empty, silently respond with 200 or 400 without creating an order to defeat dumb scrapers.
- `GET /api/orders/lookup`: Max 10 lookups per minute per IP. Always respond with generic 404 message ("رقم الطلب أو رقم الهاتف غير مطابق لبيانات مسجلة لدينا") to avoid brute-forcing phone or order numbers.

### 2.4 File Uploads & Product Images
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- **Magic Bytes Validation:** Verify actual file signatures (magic bytes), do not rely solely on `Content-Type` header or file extension.
- Maximum file size: 5 MB per image.
- Resize/compress to WebP where possible, and serve via an asset CDN or protected static path. Avoid directory traversal by generating UUID-based filenames.

### 2.5 CSV Export Safety (Formula Injection)
- When generating CSVs in `GET /api/admin/orders/export/csv`, prepend a single quote (`'`) or tab before any cell starting with `=`, `+`, `-`, or `@` to neutralize spreadsheet formula injection vulnerabilities.
- Prepend UTF-8 BOM (`\uFEFF`) so Excel on Windows properly opens Arabic characters without mojibake.

### 2.6 CORS Configuration
- Whitelist allowed origins explicitly (e.g. `https://azzabmoto.com`, `http://localhost:5173`).
- Set `Access-Control-Allow-Credentials: true`.
- Never use wildcard `Access-Control-Allow-Origin: *` in combination with credentials.

---

## 3. Prerendering & Cache Invalidation

- The AZZAB MOTO frontend uses a build-time prerenderer (`scripts/prerender.mjs`) to generate static HTML pages for SEO and immediate first-paint.
- When products or categories are modified in the admin dashboard, existing prerendered HTML pages will remain stale until a rebuild occurs.
- **Proposed Solution:** Provide a backend webhook or integration with the frontend hosting provider (Vercel / Netlify / Cloudflare Pages) that triggers a rebuild when significant product or category updates occur (e.g., debounced 10 minutes or manual "إعادة نشر الموقع" button in the admin dashboard).

---

## 4. Open Questions for Client / Backend Alignment

Please review `docs/CLIENT-DECISIONS.md`:
1. **OQ-001:** Return / refund status logic. If the client decides to add "returned", backend will need a migration and stock restoration logic.
2. **OQ-002:** Shipping fees per governorate vs flat fee.
3. **OQ-006:** Inventory tracking mode (untracked vs tracked quantities).

---

## 5. Verification Checklist for Backend Launch

- [ ] All decimal money fields formatted as string `"0.00"`
- [ ] Atomic transactions for order creation with stock lock
- [ ] Invariant: stock restores on order cancellation
- [ ] HTTP-only, Secure session cookies with SameSite
- [ ] CSRF token verification on all state-changing admin routes
- [ ] Generic error message on order lookup
- [ ] CSV formula injection protection + UTF-8 BOM
- [ ] Idempotency-Key support on POST /api/orders
- [ ] Standardized error response `{ code, message, fieldErrors? }`
