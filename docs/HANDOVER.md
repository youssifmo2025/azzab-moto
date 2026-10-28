# AZZAB MOTO — Project Handover & Client Manual

> **Package:** Starter Store (Frontend-Only, WhatsApp Ordering)  
> **Date:** October 2026  
> **Status:** Production-Ready & Security Hardened

---

## 1. How to Run & Verify Locally

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# App will run at http://localhost:5173

# Run full test suite (122 tests across 11 test suites)
npm run test

# Typecheck and lint check
npm run typecheck
npm run lint

# Build for production and run build-time prerenderer
npm run build
```

---

## 2. How to Update Products, Models, and Categories

In the Starter Store edition, catalog data is stored locally in validated JSON files inside `src/data/`. When products, prices, or compatibility change:

### Step-by-Step Workflow:

1. Open `src/data/products.json`.
2. Add, update, or remove product entries following the schema:
   ```json
   {
     "id": "prod-025",
     "slug": "unique-product-slug",
     "name": "اسم القطعة بالعربية",
     "nameEn": "OEM English Name",
     "sku": "AZB-XXX-025",
     "partNumber": "N1234567",
     "categoryId": "cat-brakes",
     "price": 450,
     "currency": "EGP",
     "availability": "in_stock",
     "images": ["/images/products/placeholder-brake-pad.webp"],
     "description": "وصف تفصيلي للقطعة واستخداماتها الأصلية.",
     "compatibility": [{ "modelId": "model-apache-160-4v", "yearFrom": 2019, "yearTo": 2024 }]
   }
   ```
3. To add a new category, update `src/data/categories.json`.
4. To add a new TVS model, update `src/data/models.json`.
5. Run `npm test` and `npm run build` to verify that all schemas parse cleanly and static HTML pages are regenerated.
6. Commit changes to Git and push to your deployment branch (Netlify / Vercel auto-deploys).

---

## 3. How to Deploy

The application is pre-configured with zero-config deployment settings for Netlify and Vercel:

### Option A: Netlify Deployment

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Security Headers & Rewrites**: Automatically loaded from `public/_headers` and `public/_redirects`. Includes strict CSP, HSTS, frame-ancestors, and SPA fallback rules.

### Option B: Vercel Deployment

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Security Configuration**: Automatically handled via `vercel.json` (rewrites, clean URLs, and HTTP security headers).

---

## 4. Clearly Marked Placeholder Content (Requires Client Review)

The following pages and components contain explicitly marked placeholder notices that must be reviewed, edited, and approved by AZZAB MOTO management before commercial launch:

1. **`src/features/static-pages/pages/AboutPage.tsx`**:
   - Company founding history, registration details, and warehouse logistics overview.
2. **`src/features/static-pages/pages/ContactPage.tsx`**:
   - Exact physical store address, working hours, and landline contacts.
3. **`src/features/static-pages/pages/ReturnsPage.tsx`**:
   - Return period (14 days suggested), electrical parts policy, and courier exchange fees.
4. **`src/features/static-pages/pages/PrivacyPage.tsx`**:
   - Customer data policy and terms of service.
5. **Authorized Dealer Badge (`src/app/config/site.ts`)**:
   - `isAuthorizedDealer` flag is currently set to `false` per legal requirements until the official TVS Egypt dealership contract is signed and confirmed. Once confirmed, set `isAuthorizedDealer: true` to display the "وكيل معتمد TVS" badge.

---

## 5. Client Questions & Open Decisions

Please clarify the following business requirements for upcoming phases:

1. **Official Dealership Status**:
   - Does AZZAB MOTO hold an authorized franchise agreement from the TVS official distributor in Egypt? Should the "وكيل معتمد TVS" badge be enabled?
2. **Product Catalog Maintenance**:
   - Who will manage product additions, price updates, and out-of-stock statuses going forward? Would the team prefer maintaining the JSON files via GitHub, or is a headless CMS / admin dashboard required earlier than Phase 2 (Business)?
3. **Shipping Fees & Delivery Zones**:
   - Are shipping fees uniform across all Egyptian governorates, or zone-based (Cairo/Giza vs. Upper Egypt vs. Frontier)?
4. **Workshop Discount Terms**:
   - What specific validation or proof (commercial register, workshop photo, wholesale minimum order) is required when mechanics reach out via WhatsApp?
5. **Real Photography Assets**:
   - When will high-resolution white-background photography of actual TVS spare parts and motorcycles be provided to replace the current placeholder assets in `/images`?
