# Baseline Metrics — Before Scope Upgrade to Business

**Date:** 2026-10-28  
**Branch:** `feature/orders-admin-frontend`  
**Starting Commit:** `79efc98` (`baseline`)

## 1. Test Suite Status
- **Test Runner:** Vitest v5.0.5
- **Test Files:** 11 files passed (100%)
- **Total Tests:** 122 tests passed, 0 failed
- **Test Coverage:** All unit tests for repositories, schemas, storage wrapper, Arabic normalization, catalog query params, hostile security inputs, prerender verification, and PWA prompt pass.

## 2. Production Build Output
- **Compiler:** `tsc -p tsconfig.app.json --noEmit` (0 errors)
- **Bundler:** Vite v8.3.5 (Rolldown + React 19 + Tailwind v4)
- **Prerenderer:** `scripts/prerender.mjs` (38 static pages, `sitemap.xml`, `robots.txt`)

### Bundle Sizes (Production Distribution)
| Asset | File Name | Raw Size | Gzip Size |
|---|---|---|---|
| **Public Entry JS** | `dist/assets/index-BXmQQOfy.js` | 429.13 kB | **132.53 kB** |
| **Main CSS** | `dist/assets/index-CHT9G2ZR.css` | 59.38 kB | **14.94 kB** |
| **Home Page** | `dist/assets/HomePage-BDlWsbbm.js` | 29.08 kB | 8.60 kB |
| **Product Page** | `dist/assets/ProductPage-YmwMwXlV.js` | 26.19 kB | 9.00 kB |
| **Catalog Page** | `dist/assets/CatalogPage-BW4c4ZAl.js` | 15.24 kB | 5.65 kB |
| **Product Card** | `dist/assets/ProductCard-JfLrT_pc.js` | 29.94 kB | 8.90 kB |
| **HTML Shell** | `dist/index.html` | 1.00 kB | 0.57 kB |

## 3. Dependency Vulnerabilities
- **Command:** `npm audit --audit-level=moderate`
- **Result:** 0 vulnerabilities found.

