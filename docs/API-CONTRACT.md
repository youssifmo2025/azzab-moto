# AZZAB MOTO — REST API Contract

> **Target Audience:** Frontend Team, Backend Team (REST API + MySQL).  
> **Status:** Proposal v1.0 (Phase 1 Baseline).  
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

### 1.4 Authentication & Session Security
- **Mechanism:** HTTP-only, Secure, SameSite=Lax (or Strict) session cookies. No JWTs or tokens stored in `localStorage` or `sessionStorage`.
- **Roles:** `admin` (super-admin), `orders_manager` (orders and inventory operator).
- **CSRF Protection:** State-changing requests (`POST`, `PATCH`, `PUT`, `DELETE`) for authenticated endpoints must provide an `X-CSRF-Token` header retrieved via `GET /api/auth/csrf-token`.
- **Rate Limiting:**
  - `POST /api/auth/login`: Max 5 failed attempts per 15 minutes per IP.
  - `POST /api/orders`: Max 10 submissions per hour per IP.
  - `GET /api/orders/lookup`: Max 10 requests per minute per IP.

### 1.5 Order Status Lifecycle
The order status enum strictly consists of 5 states:
- `new` (طلب جديد): Created by customer, pending store review.
- `processing` (قيد التجهيز): Order confirmed, package being prepared.
- `shipped` (تم الشحن): Handed over to courier.
- `delivered` (تم التسليم): Successfully delivered and COD collected.
- `cancelled` (ملغي): Cancelled.

**Transition Rules:**
- Cancellation is permitted from `new`, `processing`, and `shipped`.
- Cancellation is **FORBIDDEN** from `delivered`.
- Note on "returned": Not implemented. See `docs/CLIENT-DECISIONS.md` OQ-001.

---

## 2. API Endpoints Catalog

### 2.1 Public Endpoints (No Auth)

#### `GET /api/products`
List catalog products with filtering, search, and pagination.
- **Query Params:**
  - `page`: integer (default: 1)
  - `perPage`: integer (default: 20)
  - `categoryId`: string (optional)
  - `modelId`: string (optional)
  - `year`: integer (optional)
  - `q`: string (search term, min 1 char, sanitized)
  - `availability`: `'in_stock' | 'out_of_stock' | 'order_only'`
  - `sort`: `'price_asc' | 'price_desc' | 'latest' | 'name_asc'`
- **Response 200:**
```json
{
  "data": [
    {
      "id": "prod-1",
      "slug": "clutch-plates-apache-160",
      "name": "طقم ورق دبرياج أباتشي 160",
      "nameEn": "Clutch Plates Set Apache 160",
      "sku": "TVS-CLU-001",
      "partNumber": "N9070120",
      "categoryId": "engine",
      "price": "380.00",
      "currency": "EGP",
      "availability": "in_stock",
      "stockQuantity": 15,
      "images": ["/images/products/clutch-1.jpg"],
      "description": "طقم ورق دبرياج أصلي لدراجة TVS أباتشي 160",
      "compatibility": [
        { "modelId": "apache-160-4v", "yearFrom": 2018, "yearTo": 2024 }
      ]
    }
  ],
  "meta": { "page": 1, "perPage": 20, "total": 1, "totalPages": 1 }
}
```

#### `GET /api/products/:slug`
Fetch single product by kebab-case slug.
- **Response 200:** Product object.
- **Response 404:** `{ "code": "NOT_FOUND", "message": "المنتج غير موجود" }`

#### `GET /api/categories`
List all active product categories.
- **Response 200:**
```json
[
  {
    "id": "engine",
    "slug": "engine",
    "name": "المحرك وملحقاته",
    "icon": "Cog",
    "description": "بساتم، صبابات، سيور، ورق دبرياج وجميع أجزاء المحرك",
    "productCount": 24
  }
]
```

#### `GET /api/models`
List TVS motorcycle models supported by the store.
- **Response 200:**
```json
[
  {
    "id": "apache-160-4v",
    "name": "Apache RTR 160 4V",
    "nameAr": "أباتشي 160 4V",
    "years": [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    "imageUrl": "/images/models/apache-160-4v.png"
  }
]
```

#### `POST /api/orders`
Create a Cash-on-Delivery customer order.
- **Headers:**
  - `Idempotency-Key`: UUID v4 (required to prevent double submission)
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
*Note on `honeypotField`: If non-empty, backend silently rejects or drops request to block bots.*  
- **Response 201:**
```json
{
  "orderNumber": "AZ-202610-1001",
  "status": "new",
  "total": "760.00",
  "subtotal": "760.00",
  "shippingFee": "0.00",
  "currency": "EGP",
  "items": [
    {
      "productId": "prod-1",
      "productName": "طقم ورق دبرياج أباتشي 160",
      "price": "380.00",
      "quantity": 2,
      "total": "760.00"
    }
  ],
  "customer": {
    "name": "أحمد محمد علي",
    "phone": "01012345678",
    "governorate": "القاهرة",
    "city": "مدينة نصر",
    "address": "شارع الطيران، عمارة 15، شقة 4"
  },
  "createdAt": "2026-10-28T22:15:00.000Z"
}
```
- **Response 409 (Conflict / Out of stock):**
```json
{
  "code": "OUT_OF_STOCK",
  "message": "الكمية المطلوبة غير متوفرة لمنتج: طقم ورق دبرياج أباتشي 160",
  "fieldErrors": {
    "items[0]": ["الكمية المتاحة حالياً 1 فقط"]
  }
}
```

---

### 2.2 Customer Order Lookup (Feature Flagged: `orderTracking`)

#### `GET /api/orders/lookup`
Public lookup with low surface area.
- **Query Params:**
  - `orderNumber`: e.g. `"AZ-202610-1001"`
  - `phone`: e.g. `"01012345678"`
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

### 2.3 Authentication & Session Management

#### `GET /api/auth/csrf-token`
Returns CSRF token and sets the corresponding cookie.
- **Response 200:**
```json
{ "csrfToken": "csrf_token_string_here" }
```

#### `POST /api/auth/login`
Admin / Staff login. Sets HTTP-only session cookie upon success.
- **Request Body:**
```json
{
  "username": "admin",
  "password": "SecretPassword123"
}
```
- **Response 200:**
```json
{
  "user": {
    "id": "usr-1",
    "username": "admin",
    "name": "مدير النظام",
    "role": "admin"
  }
}
```
- **Response 401:** `{ "code": "INVALID_CREDENTIALS", "message": "اسم المستخدم أو كلمة المرور غير صحيحة" }`
- **Response 429:** `{ "code": "RATE_LIMITED", "message": "تم تجاوز عدد محاولات الدخول، يرجى المحاولة بعد 15 دقيقة" }`

#### `POST /api/auth/logout`
Terminates session and invalidates cookie.
- **Response 200:** `{ "success": true }`

#### `GET /api/auth/me`
Get current authenticated user profile and permissions.
- **Response 200:** User object.
- **Response 401:** `{ "code": "UNAUTHENTICATED", "message": "انتهت الجلسة، يرجى تسجيل الدخول" }`

#### `POST /api/auth/change-password`
Authenticated user updates their own password.
- **Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewStrongPassword456"
}
```
- **Response 200:** `{ "success": true, "message": "تم تغيير كلمة المرور بنجاح" }`

---

### 2.4 Admin Dashboard & Orders (`admin` / `orders_manager`)

#### `GET /api/admin/dashboard`
Summary statistics for dashboard cards.
- **Response 200:**
```json
{
  "todayOrdersCount": 8,
  "todayOrdersTotal": "6450.00",
  "pendingOrdersCount": 14,
  "lowStockCount": 3,
  "statusCounts": {
    "new": 6,
    "processing": 8,
    "shipped": 15,
    "delivered": 142,
    "cancelled": 5
  }
}
```

#### `GET /api/admin/orders`
Paginated orders list with filtering and search.
- **Query Params:**
  - `page`: integer (default: 1)
  - `perPage`: integer (default: 20)
  - `status`: `'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`
  - `dateFrom`: ISO Date `2026-10-01`
  - `dateTo`: ISO Date `2026-10-31`
  - `governorate`: string
  - `q`: search orderNumber or phone
- **Response 200:**
```json
{
  "data": [
    {
      "id": "ord-1",
      "orderNumber": "AZ-202610-1001",
      "customerName": "أحمد محمد علي",
      "phone": "01012345678",
      "governorate": "القاهرة",
      "status": "new",
      "total": "760.00",
      "itemsCount": 2,
      "createdAt": "2026-10-28T22:15:00.000Z"
    }
  ],
  "meta": { "page": 1, "perPage": 20, "total": 1, "totalPages": 1 }
}
```

#### `GET /api/admin/orders/:id`
Full details of an order including status transition history and customer notes.
- **Response 200:**
```json
{
  "id": "ord-1",
  "orderNumber": "AZ-202610-1001",
  "status": "new",
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
      "sku": "TVS-CLU-001",
      "productName": "طقم ورق دبرياج أباتشي 160",
      "price": "380.00",
      "quantity": 2,
      "total": "760.00"
    }
  ],
  "subtotal": "760.00",
  "shippingFee": "0.00",
  "total": "760.00",
  "internalNotes": "عميل متكرر",
  "createdAt": "2026-10-28T22:15:00.000Z",
  "history": [
    {
      "status": "new",
      "changedAt": "2026-10-28T22:15:00.000Z",
      "changedBy": "Customer",
      "note": "إنشاء الطلب"
    }
  ]
}
```

#### `PATCH /api/admin/orders/:id/status`
Update status of order and append internal note.
- **Request Body:**
```json
{
  "status": "processing",
  "note": "تم التأكيد هاتفياً مع العميل وجاري التجهيز"
}
```
- **Response 200:** Updated Order object.
- **Response 400:** Invalid status transition (e.g. attempting to cancel delivered order).

#### `GET /api/admin/orders/export/csv` (Role: `admin` only)
Trigger CSV download of filtered orders.
- **Response 200:** `text/csv; charset=utf-8` stream with BOM (`\uFEFF`) to preserve Arabic text in Excel.

---

### 2.5 Admin Products & Inventory (`admin` / `orders_manager`)

#### `GET /api/admin/products`
Paginated product management list including inventory stock.
- **Response 200:** Paginated list of products with `stockQuantity`.

#### `POST /api/admin/products`
Create new product.
- **Request Body:** Product creation payload.
- **Response 201:** Created Product object.

#### `PATCH /api/admin/products/:id`
Update product metadata, price, availability, or stock quantity.
- **Response 200:** Updated Product object.

#### `DELETE /api/admin/products/:id`
Delete a product.
- **Response 200:** `{ "success": true }`

#### `POST /api/admin/products/:id/images`
Upload product images (multipart/form-data).
- **Response 201:** Array of created image URLs.

---

### 2.6 Admin Categories (`admin` / `orders_manager`)

#### `POST /api/admin/categories`
Create category.
- **Response 201:** Created Category.

#### `PATCH /api/admin/categories/:id`
Update category name, icon, or description.
- **Response 200:** Updated Category.

#### `DELETE /api/admin/categories/:id`
Delete category.
- **Response 409:** If category contains products:
```json
{
  "code": "CATEGORY_NOT_EMPTY",
  "message": "لا يمكن حذف التصنيف لاحتوائه على منتجات مرتبطة به"
}
```

---

### 2.7 Admin User Management (Role: `admin` only)

#### `GET /api/admin/users`
List staff accounts.
- **Response 200:** Array of User accounts.

#### `POST /api/admin/users`
Create an `orders_manager` account.
- **Response 201:** Created User.

#### `PATCH /api/admin/users/:id/disable`
Disable staff account.
- **Response 200:** `{ "success": true }`
