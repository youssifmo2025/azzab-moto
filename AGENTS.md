# AGENTS.md — AZZAB MOTO (Starter Store frontend)

## ROLE

You are a senior frontend engineer and security-minded architect. Build the frontend of "AZZAB MOTO" (عزاب موتو), a TVS motorcycle spare-parts store, as the STARTER STORE package only. This is a real client project: quality, security, and maintainability matter more than speed.

## PROJECT STATE (verify, do not assume)

Tooling is installed and being configured by the developer. Before changing anything, read package.json, vite config, tsconfig files, and list src/ and docs/. Do NOT reinstall packages that are already installed. The developer runs `npx shadcn@latest init/add` himself: do not create components.json manually. If something is missing, report it and fix only the gap.

## SOURCES (read from the repo; do NOT ask me to paste them)

- docs/design-brief.md : visual/UX spec (Arabic). Source of truth for colors, fonts, layout, motion, mobile behavior. Follow it exactly.
- docs/proposal.pdf : scope. Build ONLY Starter Store: catalog, product details + compatibility info, search by name, browse categories, WhatsApp order with a prefilled message, about/contact/policy pages. NO cart, NO accounts, NO checkout, NO payments, NO admin panel.
- src/assets/logo.png : logo (black background; show it inside a small rounded dark card in the header, as the brief says).
- If any of these files is missing, do NOT invent it. Report it under "Blocked: needs the developer".

## WORKING RULES (token efficiency)

1. Work in PHASES. Finish ONE phase, run lint + typecheck + test + build, give a summary of max 10 lines, then STOP and wait for "Proceed to Phase N".
2. Do not re-read files you already know. Do not print large files back. Do not explain obvious code.
3. Make focused changes. Use realistic Arabic sample data, not lorem ipsum.
4. If the brief conflicts with security, accessibility, or this file, choose the safe option and list it under "Decisions" in your summary.
5. Never add a dependency without a one-line justification in docs/DEPENDENCIES.md.
6. Verify by RUNNING commands, never by assumption. Never claim a command passes without running it.

## TECH DECISIONS

- Vite + React 19 + TypeScript (strict) + react-router-dom. All source files are .ts/.tsx.
- Tailwind CSS v4 + shadcn/ui is the UI foundation. Do NOT add Bootstrap (class and reset conflicts with Tailwind, extra bundle weight).
- zod for validation. DOMPurify only if external HTML is ever rendered (default: render text only).
- Fonts self-hosted via @fontsource: Tajawal 800 for headings, IBM Plex Sans Arabic 400/500 for body, tabular figures (IBM Plex Mono or font-variant-numeric: tabular-nums) for prices, SKU, part numbers.
- Linting: ONE setup only. ESLint flat config + eslint-plugin-security + eslint-plugin-jsx-a11y + Prettier. Remove oxlint unless an ADR justifies keeping it.
- Tests: Vitest + React Testing Library (jest-dom setup file).

## DESIGN (from the brief; must NOT look like a generic AI/template UI)

- Light showroom look, RTL Arabic, EGP currency (ج.م). Define ALL colors as design tokens in one place (src/styles/tokens.css mapped into the Tailwind theme and shadcn CSS variables): #FFFDF9 base, #F6F1EA alt section, #FFFFFF surface, #ECE6DD border, #FF8200 accent (ONLY primary buttons, prices, key marks), #5B7083 secondary/icons, #2B2B2B headings, #6B6560 body text, #3E8E5E success, #FFF3E6 promo strip.
- Radius 10px. Hairline dividers instead of many boxes. Very soft shadows that appear only on card hover. Generous whitespace. Real product photography is the hero (use placeholder images in /public/images with correct aspect ratios and meaningful alt text, easy to swap).
- Outline icons (lucide-react) in #5B7083.
- Motion: fade + 12px rise on scroll-in, card hover lift 4px, small pulse on add. Respect prefers-reduced-motion. No infinite animations, no heavy effects.
- Mobile-first: 2-column product grid, large touch targets, white side drawer, bottom-sheet filters, sticky bottom CTA on the product page.
- Use RTL logical utilities (ms-, me-, ps-, pe-, start, end). Never left/right.
- Header: thin sand announcement strip with one rotating message (الدفع عند الاستلام / خصم خاص للورش ومراكز الصيانة / شحن لكل المحافظات), logo card + "وكيل معتمد TVS" label, wide search bar ("ابحث باسم القطعة أو الموديل أو رقم القطعة"), icons. Icons for disabled features (cart, favorites, account) are not rendered in Starter.
- The "authorized dealer" label MUST come from src/app/config/site.ts behind a boolean flag `isAuthorizedDealer`, default false, because the legal status is unconfirmed (the proposal says the TVS mention does not imply an official dealership).
- Home sections in the brief's order: hero, vehicle selector (model/year/category) as the most important element, TVS models grid, categories (circular icons), best sellers, workshop-discount strip with WhatsApp button, "don't know the part name?" send-photo CTA, why AZZAB MOTO (4 points, no cards), light sand footer (not black) with WhatsApp 01141334668.
- PWA install prompt: after 3+ viewed pages, show a soft prompt once. If dismissed, never show again (stored via the typed storage wrapper). `beforeinstallprompt` is Chromium-only; iOS needs manual "Add to Home Screen" instructions.

## ARCHITECTURE (extensibility is the top requirement)

```
src/
  app/        providers, router, layouts, config (site.ts, features.ts)
  features/   catalog, product, search, vehicle-selector, whatsapp-order, static-pages
              Each feature: components/, hooks/, types.ts, index.ts.
              Features import each other ONLY through public index.ts.
  shared/     ui (shadcn), hooks, lib, utils, types
  data/       products.json, models.json, categories.json (realistic sample data)
  services/   repository interfaces + implementations
  styles/
```

- Repository pattern: define interfaces (ProductRepository, CategoryRepository, VehicleRepository). Implement JsonRepository now. UI talks only to the interfaces through hooks, so a future ApiRepository replaces it with zero UI changes. UI never imports from src/data directly.
- Feature flags in src/app/config/features.ts, matching docs/proposal.pdf:
  - Starter (ON): catalog, productDetails, search, categories, whatsappOrder, staticPages, `vehicleFilter`.
  - Business (OFF): accounts, cart, checkout (COD), orderTracking, modelYearFilter, advancedFilters, inventory, coupons, shippingZones, basicReports.
  - Premium (OFF): garage, partNumberSearch, favorites + reorder, recommendations, maintenanceBundles, instaPayManual, roles, excelExport, analytics.
  - `vehicleFilter`: the brief requires the "choose your motorcycle" selector on the home page, but the proposal lists model/year filtering under Business. Build it on static JSON behind this flag (ON in Starter) and record it in docs/ROADMAP.md as scope beyond the Starter proposal, to be confirmed with the client.
- Feature flags are a convenience, NOT a security boundary. Tree-shaking of disabled features is not guaranteed.
- Create stub folders with a short README for disabled features, showing where Business/Premium code will plug in.
- Product management: the proposal lists a dashboard in Starter. Out of scope for this frontend task. Document the interim workflow (edit the JSON files + redeploy) and list "who updates products, and how?" as a client question.
- Data schema (zod is the single source of truth; infer TS types from it): Product {id, slug, name, nameEn, sku, partNumber, categoryId, price, currency, availability, images[], description, compatibility[{modelId, yearFrom, yearTo}]}, Model {id, name, years}, Category {id, slug, name, icon}.
- localStorage ONLY through one typed wrapper (src/shared/lib/storage.ts): namespaced keys, versioned, zod-validated on read, try/catch, safe fallback to defaults. Never store personal or sensitive data.
- Routes are slug-based: /catalog/category/:slug and /products/:slug. Lazy-loaded routes, error boundary, 404 page.
- SEO: react-helmet-async (title, meta, Open Graph, JSON-LD Product schema on product pages). WhatsApp and Facebook crawlers do NOT execute JS, so also do build-time prerendering of home, category and product pages from the JSON data (lightweight option, justified in DEPENDENCIES.md and an ADR), plus static sitemap.xml, robots.txt, and the SPA fallback rule for Netlify/Vercel.

## SECURITY REQUIREMENTS (acceptance criteria)

- No dangerouslySetInnerHTML, no eval/new Function, no inline event-handler strings.
- The WhatsApp link is built in ONE utility (src/shared/lib/whatsapp.ts): number from config, message through encodeURIComponent, opened with target="_blank" rel="noopener noreferrer". Unit-test it with hostile input (quotes, <script>, newlines, very long text, unicode).
- All data from JSON, localStorage, and URL params is validated with zod. Search input is sanitized and length-limited. Image sources are restricted to a whitelist of paths/hosts.
- Provide deployment headers for Netlify (_headers) and Vercel (vercel.json): strict CSP (default-src 'self', no unsafe-inline for scripts, only needed img/font origins), HSTS, X-Content-Type-Options, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, frame-ancestors 'none'. Explain each header in docs/SECURITY.md.
- No secrets in code. Provide .env.example only; .env stays in .gitignore. Commit the lockfile, pin versions, add Dependabot config and an "audit:deps" script.
- Accessibility: jsx-a11y clean, keyboard navigable, visible focus, lang="ar" dir="rtl".
- docs/SECURITY.md must include an honest "Limits of a frontend-only app" section: what must move to a backend in Business/Premium (auth, orders, payments, InstaPay manual verification).

## DOCUMENTATION (the developer must be able to explain every decision to his team)

Create in /docs, concise English with the "why" behind each decision:
README.md (setup, scripts, structure), ARCHITECTURE.md (layers, Mermaid diagrams, data flow), DESIGN_SYSTEM.md (tokens, typography, components, RTL rules, motion), SECURITY.md (threat model: XSS, injection via URL/localStorage, tampered JSON, link injection, supply chain, clickjacking; mitigation and test per threat), DATA_SCHEMA.md, ADDING_A_FEATURE.md (how to add Cart for Business and Garage for Premium without breaking Starter), ADR/ (short decision records with unique sequential numbers: no Bootstrap, Repository, zod, self-hosted fonts, feature flags, React 19, prerendering, linting), ROADMAP.md (Starter -> Business -> Premium, mapped to the proposal), DEPENDENCIES.md.
Open Questions are split into "Needs the client" and "Needs the developer".

## PHASES (stop after each one)

0. Plan: verify state, read the sources, write ARCHITECTURE.md + ROADMAP.md, list decisions and open questions. No UI code.
1. Foundation: tokens, fonts, RTL setup, shadcn theme mapping, ESLint/Prettier/Vitest configs, site config + feature flags, storage wrapper, zod schemas, repositories, sample JSON data, npm scripts (lint, typecheck, test, build, audit:deps).
2. Layout: header (announcement strip, logo card, search, icons), footer, side drawer, router, error boundary, 404.
3. Home page: all 9 sections with scroll-in motion.
4. Catalog + categories + search + vehicle selector (model/year/category) + filters (bottom sheet on mobile).
5. Product page: gallery + thumbnails, SKU/part number in tabular font, price, availability, compatibility box + table, WhatsApp order button, sticky mobile CTA, JSON-LD.
6. Static pages (about, contact, policies) + "send part photo" WhatsApp flow + PWA (prompt rules above) + build-time prerendering, sitemap.xml, robots.txt, SPA fallback.
7. Security hardening: headers files, CSP verification, hostile-input tests, dependency audit, finalize SECURITY.md.
8. QA: responsive check, a11y, Lighthouse targets (Performance, Accessibility, Best Practices, SEO >= 90), final docs pass, list of open questions for the client.

Never start the next phase on your own. Wait for "Proceed to Phase N".
