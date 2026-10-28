# ADR-008: Lightweight Build-Time Prerendering for SEO and Social Crawlers

## Status

Accepted

## Context

AZZAB MOTO is a motorcycle spare-parts store operating primarily through WhatsApp orders. Social crawlers (WhatsApp link preview crawler, Facebook Open Graph scraper, Telegram link bot, and search engine spiders) do not execute JavaScript when generating link previews and unfurling URLs.

When a user or shop owner shares a link to a product (e.g. `https://azzabmoto.com/products/front-brake-pads-apache-160-200`) in WhatsApp, WhatsApp fetches the static HTML only. Without prerendered `<meta property="og:title">`, `<meta property="og:image">`, `<meta property="og:description">`, and `<title>`, the preview would be blank or fallback to the generic homepage metadata.

Options evaluated:

1. **Headless Chromium / Puppeteer / Playwright**:
   - Heavy (downloads 200MB–400MB browser binary).
   - Vulnerable to CI/CD timeout and sandboxed environment permission restrictions.
   - Excessive build times for a static catalog.
2. **Third-party SaaS (e.g. Prerender.io)**:
   - Introduces ongoing monthly operational cost, external network dependency, and potential uptime risk.
3. **Full Full-Stack SSR Migration (Next.js / Remix / Vite SSR)**:
   - Overkill for a Starter Store with static catalog data. Requires a Node.js server container instead of zero-cost static hosting (Netlify/Vercel/Cloudflare Pages).
4. **Lightweight Node.js Build-Time Templating Script (`scripts/prerender.mjs`)**:
   - Reads `dist/index.html` produced by Vite.
   - Reads existing `src/data/*.json` files directly.
   - Injects canonical, title, Open Graph, Twitter cards, and Schema.org Product JSON-LD for each page.
   - Outputs static `dist/[route]/index.html` files and automatically produces `sitemap.xml` and `robots.txt`.
   - Runs in <100ms with zero extra runtime or dev dependencies.

## Decision

Adopt Option 4: A lightweight, zero-dependency Node.js script executed immediately post-build (`npm run build`).

## Consequences

- **Positive**:
  - Perfect Open Graph previews in WhatsApp, Telegram, Facebook, and iMessage.
  - Search engines receive fully indexable static HTML with valid Schema.org Product structured data.
  - Zero heavy browser dependencies in `package.json`.
  - Zero deployment infrastructure changes — fully static files deployable on Netlify, Vercel, or GitHub Pages.
- **Negative**:
  - When products or categories in JSON are updated, a rebuild/redeploy is required to update the prerendered files (completely acceptable for Starter Store static JSON architecture).
