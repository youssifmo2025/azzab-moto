# AZZAB MOTO — REST API Contract

> **Target Audience:** Frontend Team, Backend Team (REST API + MySQL).  
> **Status:** Proposal v1.1 (Phase 1 Approved Baseline with Corrections).  
> **Design Philosophy:** Backend is authoritative for business rules, pricing, inventory validation, and RBAC security. Frontend provides accessible, responsive, localized (Arabic RTL) validation and UX defense-in-depth.

---

## 1. Global Conventions

### 1.1 Base URL & Environment
- Public Base URL: Configured via `VITE_API_BASE_URL` (e.g. `https://api.azzabmoto.com` in production, `http://localhost:3000` in dev).
- All endpoints are prefixed with `/api`.
- Client credentials mode: `include` (`credentials: 'include'`) for all fetch calls.

### 1.2 Data Formats & Conventions
- **Data Exchange:** `application/json; charset=utf-8`.
- **Currency & Money:** All financial amounts are returned and exchanged as **fixed 2-decimal string representations** in Egyptian Pounds (EGP), e.g. `"380.00"`, `"1250.50"`. Integer piasters and floating-point representations are forbidden in wire transfer to eliminate float precision loss.
- **Dates & Times:** ISO-8601 UTC strings (`YYYY-MM-DDTHH:mm:ss.sssZ`), e.g. `2026-10-28T22:00:00.000Z`.
- **Phone Numbers:** Egyptian mobile format `01[0125]XXXXXXXX` (11 digits, starting with 010, 011, 012, or 015).
- **Language / Locale:** Error messages returned in Arabic (`ar-EG`) by default or fallback English code.
- **Pagination Shape:**
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### 1.3 Error Handling Format
All 4xx and 5xx responses MUST return a unified JSON payload:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "بيانات الطلب غير صحيحة، يرجى مراجعة الحقول المشار إليها",
  "fieldErrors": {
    "phone": ["رقم الهاتف يجب أن يكون رقم محمول مصري صحيح (11 رقم)"]
  }
}
```

Standard Error Codes:
- `UNAUTHENTICATED` (401): Session expired or missing cookie.
- `FORBIDDEN` (403): User lacks permission for this resource.
- `NOT_FOUND` (404): Resource does not exist.
- `VALIDATION_ERROR` (400 / 422): Malformed payload or validation rules failed.
- `CONFLICT` (409): Resource conflict (e.g., category has products, stock depleted).
- `RATE_LIMITED` (429): Too many requests (`Retry-After` header included).
- `INTERNAL_SERVER_ERROR` (500): Server error.

### 1.4 Authentication, RBAC Roles & Session Security
- **Mechanism:** HTTP-only, Secure, SameSite=Lax session cookies. No JWTs or tokens stored in `localStorage` or `sessionStorage`.
- **Role Permissions:**
  - `admin`: Full administrative control. Can create/update/soft-delete products, upload/delete/reorder images, manage/reorder categories, manage user accounts, reset staff passwords, and export CSVs.
  - `orders_manager`: Restricted operator role.
    - **Forbidden:** Must NOT create, update, or delete products, categories, or images (attempts return 403 Forbidden).
    - **Allowed (Read-Only Catalog):** Can view products and real-time stock levels (`GET /api/admin/products`, `GET /api/admin/products/:id`) and view categories (`GET /api/admin/categories`).
    - **Allowed (Orders Operations):** Full access to orders dashboard (`GET /api/admin/dashboard`), orders listing (`GET /api/admin/orders`), order details (`GET /api/admin/orders/:id`), and order status updates (`PATCH /api/admin/orders/:id/status`).
- **CSRF Protection:** Mutating requests (`POST`, `PATCH`, `PUT`, `DELETE`) for authenticated endpoints must provide an `X-CSRF-Token` header retrieved via `GET /api/auth/csrf-token`.
- **Explicit Rate Limits (Enforced by Backend):**
  - `POST /api/auth/login`: Maximum 5 failed attempts per 15 minutes per IP address. When exceeded, return `429 Too Many Requests` with a `Retry-After: <seconds>` header.
  - `POST /api/orders`: Maximum 10 submissions per hour per IP address. Must require an `Idempotency-Key` UUID v4 header to deduplicate accidental double submissions.
  - `POST /api/orders/lookup`: Maximum 10 requests per minute per IP address. Must use generic 404 responses to prevent enumeration of customer phone numbers or order numbers.

### 1.5 Order Status Lifecycle
The order status enum strictly consists of 5 states:
- `new` (طلب جديد): Created by customer, pending store review.
- `processing` (قيد التجهيز): Order confirmed, package being prepared.
- `shipped` (تم الشحن): Handed over to courier.
- `delivered` (تم التسليم): Successfully delivered and COD collected.
- `cancelled` (ملغي): Cancelled.

**Transition Rules:**
- Cancellation is permitted from `new`, `processing`, and `shipped`.
- Cancellation is **FORBIDDEN** from `delivered` (returns 400 Bad Request).
- Note on "returned": Not implemented. See `docs/CLIENT-DECISIONS.md` OQ-001.

---

## 2. API Endpoints Catalog

### 2.1 Public Endpoints (No Auth)

#### `GET /api/products`
List catalog products with filtering, search, and pagination (excludes soft-deleted products where `isActive = false`).
- **Query Params:**
  - `page`: integer (default: 1)
  - `perPage`: integer (default: 20)
  - `categoryId`: string (optional)
  - `modelId`: string (optional)
  - `year`: integer (optional)
  - `q`: string (search term, min 1 char, sanitized)
  - `availability`: `'in_stock' | 'out_of_stock' | 'order_only'`
  - `sort`: `'price_asc' | 'price_desc' | 'latest' | 'name_asc'`
- **Response 200:** Paginated products response.

#### `GET /api/products/:slug`
Fetch single product by kebab-case slug.
- **Response 200:** Product object.
- **Response 404:** `{ "code": "NOT_FOUND", "message": "المنتج غير موجود" }`

#### `GET /api/categories`
List all active product categories.
- **Response 200:** Array of Category objects.

#### `GET /api/models`
List TVS motorcycle models supported by the store.
- **Response 200:** Array of Model objects.

#### `POST /api/orders`
Create a Cash-on-Delivery customer order.
- **Rate Limit:** Max 10 per hour per IP.
- **Headers:**
  - `Idempotency-Key`: UUID v4 (required)
- **Request Body:**
```json
{
  "customer": {
    "name": "أحمد محمد علي",
    "phone": "01012345678",
    "governorate": "القاهرة",
    "city": "مدينة نصر",
    "address": "شارع الطيران، عمارة 15، شقة 4",
    "notes": "يرجى الاتصال قبل الوصول"
  },
  "items": [
    {
      "productId": "prod-1",
      "quantity": 2
    }
  ],
  "honeypotField": ""
}
```
*Note on `honeypotField`: If non-empty, backend silently drops/rejects the request to defeat automated spam bots.*  
- **Response 201:** `OrderConfirmation` object.
- **Response 409 (Conflict / Out of stock):** Returned if requested quantity exceeds available stock during atomic transaction.

---

### 2.2 Customer Order Lookup (Feature Flagged: `orderTracking`)

#### `POST /api/orders/lookup`
Public lookup with low surface area. **Must use POST with JSON body so customer PII (phone number) never appears in URL query parameters, proxy logs, or server access logs.**
- **Rate Limit:** Max 10 requests per minute per IP.
- **Request Body:**
```json
{
  "orderNumber": "AZ-202610-1001",
  "phone": "01012345678"
}
```
- **Response 200:**
```json
{
  "orderNumber": "AZ-202610-1001",
  "status": "shipped",
  "createdAt": "2026-10-28T22:15:00.000Z",
  "statusUpdatedAt": "2026-10-29T10:00:00.000Z",
  "total": "760.00",
  "itemsCount": 2,
  "governorate": "القاهرة"
}
```
- **Response 404 (Security Generic Message):**
```json
{
  "code": "NOT_FOUND",
  "message": "رقم الطلب أو رقم الهاتف غير مطابق لبيانات مسجلة لدينا"
}
```

---

### 2.3 Authentication & Staff Account Security

#### `GET /api/auth/csrf-token`
Returns CSRF token and sets the corresponding cookie.
- **Response 200:** `{ "csrfToken": "csrf_token_string" }`

#### `POST /api/auth/login`
Admin / Staff login. Sets HTTP-only session cookie upon success.
- **Rate Limit:** Max 5 failed attempts per 15 minutes per IP (`Retry-After` header on 429).
- **Request Body:** `{ "username": "admin", "password": "SecretPassword123" }`
- **Response 200:**
```json
{
  "user": {
    "id": "usr-1",
    "username": "manager",
    "name": "مسؤول الطلبات",
    "role": "orders_manager",
    "disabled": false,
    "mustChangePassword": true
  }
}
```
*Note on `mustChangePassword`: When true, the frontend client MUST immediately redirect and force the user to the change-password screen before allowing any dashboard navigation.*

#### `POST /api/auth/logout`
Terminates session and invalidates cookie.
- **Response 200:** `{ "success": true }`

#### `GET /api/auth/me`
Get current authenticated user profile and permissions.
- **Response 200:** User object.
- **Response 401:** `{ "code": "UNAUTHENTICATED", "message": "انتهت الجلسة، يرجى تسجيل الدخول" }`

#### `POST /api/auth/change-password`
Authenticated user updates their own password. Clears `mustChangePassword` to `false`.
- **Request Body:** `{ "currentPassword": "OldPassword123", "newPassword": "NewStrongPassword456" }`
- **Response 200:** `{ "success": true, "message": "تم تغيير كلمة المرور بنجاح" }`

---

### 2.4 Admin Dashboard & Orders (`admin` / `orders_manager`)

#### `GET /api/admin/dashboard`
Summary statistics for dashboard KPI cards.
- **Roles:** `admin`, `orders_manager`
- **Response 200:** Dashboard summary metrics.

#### `GET /api/admin/orders`
Paginated orders list with filtering and search.
- **Roles:** `admin`, `orders_manager`
- **Query Params:** `page`, `perPage`, `status`, `dateFrom`, `dateTo`, `governorate`, `q`
- **Response 200:** Paginated orders list.

#### `GET /api/admin/orders/:id`
Full details of an order including status transition history, internal notes, and customer address.
- **Roles:** `admin`, `orders_manager`
- **Response 200:** Order detail object.

#### `PATCH /api/admin/orders/:id/status`
Update status of order and append internal note.
- **Roles:** `admin`, `orders_manager`
- **Request Body:** `{ "status": "processing", "note": "تم التأكيد هاتفياً" }`
- **Response 200:** Updated Order object.
- **Response 400:** If attempting to cancel an already `delivered` order.

#### `GET /api/admin/orders/export/csv`
Trigger CSV download of filtered orders. Prepend single-quote to prevent spreadsheet formula injection and include UTF-8 BOM (`\uFEFF`).
- **Roles:** `admin` ONLY (open decision in `docs/CLIENT-DECISIONS.md` OQ-008).
- **Response 200:** `text/csv; charset=utf-8` stream.

---

### 2.5 Admin Products & Inventory

#### `GET /api/admin/products`
Paginated product management list including inventory stock counts and `isActive` status.
- **Roles:** `admin`, `orders_manager` (orders manager has read-only stock visibility).
- **Response 200:** Paginated list of products.

#### `GET /api/admin/products/:id`
Get full single product details by ID for editing or inspection.
- **Roles:** `admin`, `orders_manager`
- **Response 200:** Product object.

#### `POST /api/admin/products`
Create new product.
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Request Body:** Product creation payload with `isActive: true`.
- **Response 201:** Created Product object.

#### `PATCH /api/admin/products/:id`
Update product metadata, price, availability, stock quantity, or perform **Soft Delete** (`isActive: false`).  
*Architectural Note on Soft Delete: Hard deletion is strictly forbidden to preserve foreign keys, historical receipts, and order item snapshots intact. Setting `isActive: false` hides the product from the public catalog while preserving historical order data.*
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Request Body:** `{ "isActive": false }` or any partial product fields.
- **Response 200:** Updated Product object.

#### `POST /api/admin/products/:id/images`
Upload product images (multipart/form-data). Must validate MIME type and magic bytes.
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Response 201:** Array of uploaded image URLs.

#### `DELETE /api/admin/products/:id/images/:imageId`
Delete a single product image.
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Response 200:** `{ "success": true, "message": "تم حذف الصورة بنجاح" }`

#### `PUT /api/admin/products/:id/images/reorder`
Reorder product images and define primary image (the first item in the array is designated as primary).
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Request Body:** `{ "images": ["/images/p1.webp", "/images/p2.webp"] }`
- **Response 200:** `{ "success": true, "images": [...] }`

---

### 2.6 Admin Categories

#### `GET /api/admin/categories`
List all categories with admin metadata (including product counts).
- **Roles:** `admin`, `orders_manager`
- **Response 200:** Array of Category objects.

#### `POST /api/admin/categories`
Create category.
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Response 201:** Created Category object.

#### `PATCH /api/admin/categories/:id`
Update category name, slug, icon, or description.
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Response 200:** Updated Category object.

#### `PUT /api/admin/categories/reorder`
Reorder display sequence of categories in the store.
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Request Body:** `{ "categoryIds": ["cat-brakes", "cat-engine", "cat-filters"] }`
- **Response 200:** `{ "success": true, "categories": [...] }`

#### `DELETE /api/admin/categories/:id`
Delete category. Blocked if any products (active or soft-deleted) reference this category.
- **Roles:** `admin` ONLY (`orders_manager` receives 403 Forbidden).
- **Response 200:** `{ "success": true, "message": "تم حذف التصنيف بنجاح" }`
- **Response 409:** If category contains products:
```json
{
  "code": "CATEGORY_NOT_EMPTY",
  "message": "لا يمكن حذف التصنيف لاحتوائه على منتجات مرتبطة به"
}
```

---

### 2.7 Admin Staff Account Management (Role: `admin` ONLY)

#### `GET /api/admin/users`
List staff accounts.
- **Roles:** `admin` ONLY.
- **Response 200:** Array of User accounts.

#### `POST /api/admin/users`
Create an `orders_manager` staff account with a temporary password and forced password change flag.
- **Roles:** `admin` ONLY.
- **Request Body:**
```json
{
  "username": "manager2",
  "name": "محمود إبراهيم",
  "role": "orders_manager"
}
```
- **Response 201:**
```json
{
  "user": {
    "id": "usr-3",
    "username": "manager2",
    "name": "محمود إبراهيم",
    "role": "orders_manager",
    "disabled": false,
    "mustChangePassword": true
  },
  "temporaryPassword": "Tmp@948123"
}
```

#### `PATCH /api/admin/users/:id/disable`
Disable staff account (immediately blocks login).
- **Roles:** `admin` ONLY.
- **Response 200:** `{ "success": true, "message": "تم إيقاف تفعيل الحساب" }`

#### `PATCH /api/admin/users/:id/enable`
Re-activate a disabled staff account.
- **Roles:** `admin` ONLY.
- **Response 200:** `{ "success": true, "message": "تمت إعادة تفعيل الحساب" }`

#### `POST /api/admin/users/:id/reset-password`
Admin generates a temporary password for a staff member and sets `mustChangePassword: true`.
- **Roles:** `admin` ONLY.
- **Response 200:**
```json
{
  "success": true,
  "temporaryPassword": "Rst@749210",
  "message": "تم إعادة تعيين كلمة المرور بنجاح. يجب على الموظف تغييرها عند تسجيل الدخول الأول."
}
```
