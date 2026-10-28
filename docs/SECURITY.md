# AZZAB MOTO — Security Architecture & Threat Model

> **Status:** Production Hardened (Phase 7 Complete)  
> **Package Scope:** Starter Store (Frontend-Only, WhatsApp Ordering)

---

## 1. Threat Model & Risk Matrix

| Threat & Vector                                                                                                                                            | Impact   | Mitigation Strategy                                                                                                                                                                                                                                                                                                                                       | Test & Verification                                                                                                                              | Residual Risk                                                                                                                |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **XSS via Product / Catalog Data**<br>Tampered or malicious `products.json` injecting `<script>` or event handlers.                                        | High     | • All catalog reads validated via strict Zod schemas.<br>• Pure React JSX text node interpolation (automatic HTML escaping).<br>• Zero `dangerouslySetInnerHTML`, zero `eval()`, zero `new Function`.                                                                                                                                                     | • `src/test/schemas.test.ts`<br>• `scripts/audit-code.mjs`<br>• Automated CI grep rules.                                                         | **Low**: Data files are static, committed to version control, and checked at build time.                                     |
| **Reflected XSS & Injection via URL**<br>Malicious payloads in query parameters (`?q=...`, `?sort=...`, `?year=...`).                                      | High     | • `CatalogQueryParamsSchema` validates and sanitizes all query parameters via Zod.<br>• `sanitizeSearch()` strips HTML tags, script tags, Unicode Bidi overrides, and path traversal sequences.<br>• Strict length cap (`MAX_SEARCH_LENGTH = 100`).                                                                                                       | • `src/test/security-hostile-input.test.ts`<br>• Tested against `<script>`, `<iframe>`, `onerror`, Bidi overrides, prototype pollution.          | **Negligible**: Sanitized string is treated as raw text; no `eval` or DOM parsing occurs.                                    |
| **Client-Side Storage Tampering**<br>Malicious extension, tab, or user injecting corrupted JSON or prototype pollution into `localStorage`.                | Medium   | • Single typed storage wrapper (`src/shared/lib/storage.ts`) with `am_` namespace and `_v1` suffix.<br>• Every read is validated against Zod schema with fallback to default values.<br>• Enclosed in `try/catch` to survive privacy mode or quota exceptions.<br>• Strictly zero PII or credentials stored.                                              | • `src/test/storage.test.ts`<br>• Tested with malformed JSON, invalid schema shapes, and prototype pollution keys.                               | **Negligible**: Storage values do not execute code and default safely upon any parse anomaly.                                |
| **WhatsApp Link Hijacking & Phishing**<br>Crafted link attempting to redirect recipient, inject Bcc headers, or spoof target numbers.                      | High     | • Single centralized builder (`src/shared/lib/whatsapp.ts`).<br>• Recipient phone is immutable, taken strictly from `siteConfig.whatsappNumber` (`201141334668`).<br>• Messages sanitized (null-bytes stripped, capped at 1000 chars) and passed through `encodeURIComponent`.<br>• Links open strictly with `target="_blank" rel="noopener noreferrer"`. | • `src/test/whatsapp.test.ts`<br>• `src/test/security-hostile-input.test.ts`<br>• `scripts/audit-code.mjs` verifies `rel="noopener noreferrer"`. | **Low**: User can edit prefilled message inside WhatsApp before hitting send, but cannot alter the store destination number. |
| **Clickjacking & UI Redressing**<br>Attacker embeds AZZAB MOTO in an invisible `<iframe>` to trick users into unauthorized clicks.                         | Medium   | • `Content-Security-Policy: frame-ancestors 'none'` in deployment headers.<br>• Legacy defense-in-depth: `X-Frame-Options: DENY`.                                                                                                                                                                                                                         | • Verified in `public/_headers` and `vercel.json`.                                                                                               | **Zero**: Modern browsers strictly reject framing.                                                                           |
| **Data Exfiltration / Unauthorized Scripts**<br>Inline scripts or third-party scripts attempting to extract telemetry or communicate with attacker origin. | High     | • Strict Content Security Policy.<br>• `default-src 'self'`.<br>• `script-src 'self'` (Strictly NO `'unsafe-inline'` for scripts).<br>• `connect-src 'self'` (Zero external API calls allowed).<br>• `object-src 'none'`.                                                                                                                                 | • Verified in `public/_headers` and `vercel.json`.                                                                                               | **Zero**: Outbound network requests and unauthorized inline scripts are blocked at browser engine level.                     |
| **ReDoS & Client CPU Exhaustion**<br>Extremely long strings or nested patterns submitted to search inputs.                                                 | Low      | • `sanitizeSearch()` enforces hard cap of 100 characters.<br>• Linear regex expressions without catastrophic backtracking.<br>• Catalog pagination / load-more bounds UI rendering to 12 products per chunk.                                                                                                                                              | • `src/test/security-hostile-input.test.ts` (10,000-character repetition test).                                                                  | **Negligible**: Execution time is bounded under 1ms.                                                                         |
| **Supply Chain Vulnerabilities**<br>Compromised dependencies in `node_modules`.                                                                            | Critical | • `package-lock.json` committed with pinned versions.<br>• `npm run audit:deps` integrated into CI.<br>• Automated weekly Dependabot scanning via `.github/dependabot.yml`.<br>• Minimal dependencies justified in `docs/DEPENDENCIES.md`.                                                                                                                | • `npm run audit:deps` reports 0 vulnerabilities.                                                                                                | **Low**: Requires periodic review of Dependabot PRs.                                                                         |

---

## 2. HTTP Security Headers & Content Security Policy (CSP)

The deployment configurations in `public/_headers` (Netlify) and `vercel.json` (Vercel) apply the following production security headers across all routes:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

### Directive Breakdown & Rationales:

1. **`default-src 'self'`**: Sets a restrictive baseline; all resources must originate from the same origin unless explicitly allowed.
2. **`script-src 'self'`**:
   - Strictly permits scripts bundled and fingerprinted by Vite only.
   - **NO `'unsafe-inline'` and NO `'unsafe-eval'`**. Any injected `<script>` tag or `eval()` call is blocked immediately by the browser.
3. **`style-src 'self' 'unsafe-inline'`**:
   - **Specific Architecture Decision**: Styles are loaded from self-hosted stylesheets (`/assets/*.css`).
   - The `'unsafe-inline'` token is allowed **only for stylesheets** because Tailwind CSS v4 and shadcn/ui rely on runtime dynamic CSS custom properties (e.g., `--radix-collapsible-content-height`, theme token overrides).
   - This does **not** compromise script security because script execution is governed by `script-src`.
4. **`img-src 'self' data:`**:
   - Restricts images to local assets and inline base64/SVG data URIs.
   - Protects against cross-site image tracking and rogue image hotlinking.
5. **`font-src 'self'`**:
   - Web fonts (Tajawal, IBM Plex Sans Arabic, IBM Plex Mono) are 100% self-hosted via `@fontsource`.
   - Zero reliance on external Google Fonts CDN or third-party servers.
6. **`connect-src 'self'`**:
   - In Starter Store, there are no external analytics, beacons, or third-party APIs. Fetch requests are restricted to same-origin data and Service Worker caches.
7. **`frame-ancestors 'none'`**:
   - Forbids any domain (including same-origin) from framing this application, eliminating clickjacking attacks.
8. **`base-uri 'self'`**:
   - Prevents DOM-based injection of `<base>` tags that could redirect relative links or script fetches.
9. **`form-action 'self'`**:
   - Restricts form submissions. (In Starter Store, no HTML `<form>` submits; orders navigate to `https://wa.me/...`).
10. **`object-src 'none'`**:
    - Disables legacy browser plugins (Flash, Java, ActiveX, embed).
11. **`Strict-Transport-Security` (HSTS)**:
    - `max-age=31536000; includeSubDomains; preload`: Mandates HTTPS for a minimum of 1 year, covers all subdomains, and qualifies for the HSTS Preload list.
12. **`X-Content-Type-Options: nosniff`**:
    - Prevents MIME-sniffing, ensuring browsers strictly honor the declared `Content-Type`.
13. **`Referrer-Policy: strict-origin-when-cross-origin`**:
    - Protects user privacy: sends the full URL for same-origin requests, only origin for HTTPS cross-origin, and zero referrer on protocol downgrades.
14. **`Permissions-Policy`**:
    - Completely disables sensitive hardware APIs (`camera=(), microphone=(), geolocation=(), payment=(), usb=()`) preventing abuse by third-party scripts.

---

## 3. Codebase Security Verification & Static Analysis

An automated static audit script (`scripts/audit-code.mjs`) checks the entire `src/` tree during CI:

- **`dangerouslySetInnerHTML`**: 0 occurrences.
- **`eval()` / `new Function()`**: 0 occurrences.
- **`element.innerHTML`**: 0 occurrences.
- **`target="_blank"`**: 100% accompanied by `rel="noopener noreferrer"`.
- **Direct JSON import in UI**: 0 occurrences (UI interacts exclusively with repository interfaces).
- **Direct `localStorage` access**: 0 occurrences outside `src/shared/lib/storage.ts`.
- **Dependency Vulnerabilities**: 0 moderate or higher vulnerabilities per `npm audit`.

---

## 4. Limits of a Frontend-Only App

The Starter Store package is intentionally built as a lightweight, static, frontend-only architecture. While this provides zero server-side attack surface, the client and development team must understand what **cannot** be enforced purely client-side and must be migrated to a backend in future phases (Business / Premium).

### What CANNOT Be Secured Frontend-Only:

1. **Order Integrity & Tamper Proofing**:
   - **Reality**: A WhatsApp order generates a prefilled message. Once WhatsApp opens, the client has complete freedom to edit the text, alter the price, change the part number, or modify quantities before tapping send.
   - **Business/Premium Requirement**: Order submission must move to a server-side API (e.g., Node.js / PostgreSQL) that generates an immutable server-side Order ID with cryptographic signature or verified database record.

2. **Customer Identity & Workshop Verification**:
   - **Reality**: The "Workshop Discount" strip directs mechanics to WhatsApp. The frontend cannot verify commercial registrations, tax cards, or mechanic credentials.
   - **Business/Premium Requirement**: Requires customer accounts, JWT/Session authentication, and a back-office admin dashboard for manual verification and approval of wholesale accounts.

3. **Pricing & Inventory Confidentiality**:
   - **Reality**: Product prices, SKUs, and stock availability statuses reside in static JSON files delivered to the client. Any tech-savvy user can open DevTools and view `src/data/products.json`.
   - **Business/Premium Requirement**: If wholesale tier pricing, dealer purchase costs, or secret margin structures are introduced, they must remain behind an authenticated backend API.

4. **Automated Payment & InstaPay Verification**:
   - **Reality**: Any client-side flow that asks a user to upload an InstaPay transfer receipt or enter a transaction reference cannot verify whether the funds actually landed in the store's bank account. Trusting a client-side screenshot is trivial to forge.
   - **Premium Requirement**: Automated webhook integration with payment gateways (e.g., Paymob, Fawry) or authenticated admin reconciliation with bank statements.

5. **API Rate Limiting & Abuse Prevention**:
   - **Reality**: There is no backend server to enforce IP-based rate limiting on search queries or order attempts.
   - **Starter Mitigation**: Abuse is limited by WhatsApp's own anti-spam measures and the static nature of the frontend.
