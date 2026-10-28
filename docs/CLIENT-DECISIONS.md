# Client Decisions — AZZAB MOTO

> **Purpose:** Business decisions that require client input before the frontend can implement them or before the backend can configure them.  
> Status: `OPEN` = needs client decision | `DECIDED` = confirmed by client | `DEFAULT` = current implementation default (change requires client approval)

---

## OPEN QUESTIONS

### OQ-001 — Order Return / Refund Status
**Question:** Should cancelled orders that were already shipped be tracked with a "returned" status, or is "cancelled" sufficient?  
**Impact (Backend):** If a "returned" status is added later, the backend must handle stock restoration logic (restore `stock_quantity` atomically when status transitions to `returned`). Adding it after launch requires a database migration and a new status label in all Arabic UI strings.  
**Impact (Frontend):** A new badge color, filter, and admin action button.  
**Current implementation:** Order status enum is fixed at `new | processing | shipped | delivered | cancelled`. Cancellation is allowed from `new`, `processing`, and `shipped` states. "returned" is intentionally absent pending this decision.  
**Deadline:** Before backend implements order status transitions.

---

### OQ-002 — Shipping Fees per Governorate
**Question:** Should shipping fees vary by governorate, or is there a flat fee (or free shipping)?  
**Impact:** If variable, the backend must store a `shipping_zones` table and the frontend checkout must display the calculated fee before the customer confirms. If flat, a single config value is sufficient.  
**Current implementation:** `shippingFee` config key exists in `src/app/config/site.ts` but is currently `undefined` (treated as 0 / free shipping display).  
**Deadline:** Before Phase 2 (checkout) is finalized.

---

### OQ-003 — Price Color Mode
**Question:** Which color should be used for prices and primary text links?  
- **Option A `#FF8200` (brand orange)** — matches brand identity; contrast ratio on `#FFFDF9` is ~3.0:1 (passes WCAG AA for large/bold text ≥18px, fails for small text).  
- **Option B `#B45300` (accessible amber)** — contrast ratio on `#FFFDF9` is ~4.87:1 (passes WCAG AA for all text sizes).  
**Current implementation:** `--color-accent-text: #B45300` is the CSS token used for text (per ADR-009). Changing to `#FF8200` for text requires a design override and an accessibility justification.  
**Deadline:** Before Phase 5 audit.

---

### OQ-004 — Authorized Dealer Badge
**Question:** Has the formal TVS Egypt dealer agreement been confirmed?  
**Impact:** `isAuthorizedDealer: false` in `src/app/config/site.ts` hides the "وكيل معتمد TVS" badge in the header and product pages.  
**Action:** When confirmed, change to `true`. No code change needed.  
**Deadline:** Anytime.

---

### OQ-005 — Order Lookup Feature
**Question:** Should customers be able to look up their order status by order number + phone number (without creating an account)?  
**Current implementation:** `orderTracking: false` feature flag. Route `/track-order` is planned but not yet built.  
**Security note:** The backend must return **generic error messages** ("رقم الطلب أو رقم الهاتف غير صحيح") to prevent enumeration attacks. Never reveal whether the order number or phone is wrong separately.  
**Deadline:** Before Phase 3.

---

### OQ-006 — Stock Tracking Mode
**Question:** Should inventory quantities be tracked per product?  
- **Tracked:** `stock_quantity: number` — backend decrements on order, frontend shows low-stock badge when below threshold.  
- **Untracked:** `stock_quantity: null` — availability is manual (`in_stock` / `out_of_stock` / `order_only`).  
**Current implementation:** No `stock_quantity` field. Availability is a 3-value enum (manual). Phase 3 adds a nullable `stock_quantity` field — `null` means untracked.  
**Deadline:** Before Phase 3 admin dashboard.

---

### OQ-007 — Hero Headline Variant
**Question:** Should the hero headline include the word "الأصلية" (e.g., "قطع غيار TVS الأصلية") or not?  
**Impact:** Legal/marketing claim. "أصلية" implies OEM certification. See also OQ-004.  
**Current implementation:** Hero uses the generic tagline from `siteConfig.tagline`.  
**Deadline:** Before Phase 2 (public UI changes).

---

### OQ-008 — CSV Export Scope (Admin)
**Question:** Should the CSV export include customer phone numbers and addresses, or only order summary data (order number, items, total, status, date)?  
**Impact:** Privacy/GDPR-equivalent considerations. Full export exposes PII. Summary export is safer for delegated roles.  
**Current implementation:** Phase 3 plans a CSV export endpoint (`GET /api/admin/orders/export/csv`) — scope to be confirmed.  
**Deadline:** Before Phase 3.

---

## DECIDED

*(None yet — all decisions are OPEN pending first client meeting.)*

---

## DEFAULTS (in effect until overridden)

| Config | Default | Location |
|--------|---------|----------|
| Shipping fee | 0 (free) | `src/app/config/site.ts` |
| Price text color | `#B45300` (accessible) | `src/styles/tokens.css` |
| Authorized dealer badge | Hidden | `src/app/config/site.ts` |
| Order tracking | Disabled | `src/app/config/features.ts` |
| Stock tracking | Untracked (null) | Phase 3 schema |
| Cart/Checkout | Disabled | `src/app/config/features.ts` |

