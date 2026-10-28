# AZZAB MOTO — Dependencies

Every runtime and dev dependency must be justified here before being added.

---

## Runtime Dependencies

| Package                            | Version   | Justification                                                                         |
| ---------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| `react`                            | `^19.3.1` | UI framework. React 19 required by React Compiler.                                    |
| `react-dom`                        | `^19.3.1` | React DOM renderer.                                                                   |
| `react-router-dom`                 | `^7.x`    | Client-side routing. Industry standard.                                               |
| `zod`                              | `^3.x`    | Runtime schema validation — single source of truth for types + security. See ADR-003. |
| `react-helmet-async`               | `^2.x`    | Thread-safe `<head>` management for SEO meta tags per route.                          |
| `lucide-react`                     | `^0.x`    | Outline icon set. Tree-shakable, consistent with design brief.                        |
| `@fontsource/tajawal`              | `^5.x`    | Self-hosted Arabic display font (headings). See ADR-004.                              |
| `@fontsource/ibm-plex-sans-arabic` | `^5.x`    | Self-hosted Arabic body font. See ADR-004.                                            |
| `@fontsource/ibm-plex-mono`        | `^5.x`    | Self-hosted monospace for prices, SKU, part numbers.                                  |

## Dev Dependencies

| Package                       | Version  | Justification                                        |
| ----------------------------- | -------- | ---------------------------------------------------- |
| `vite`                        | `^8.3.5` | Build tool. Already in scaffold.                     |
| `@vitejs/plugin-react`        | `^6.x`   | React + React Compiler support for Vite.             |
| `@rolldown/plugin-babel`      | `^0.x`   | Babel integration for React Compiler preset.         |
| `@babel/core`                 | `^7.x`   | Required by babel plugin.                            |
| `babel-plugin-react-compiler` | `^1.x`   | Automatic memoization via React Compiler.            |
| `typescript`                  | `^5.x`   | Type safety. See ADR-006.                            |
| `@types/react`                | `^19.x`  | TypeScript types for React.                          |
| `@types/react-dom`            | `^19.x`  | TypeScript types for React DOM.                      |
| `tailwindcss`                 | `^4.x`   | Utility CSS framework. See ADR-001.                  |
| `@tailwindcss/vite`           | `^4.x`   | Vite plugin for Tailwind v4.                         |
| `oxlint`                      | `^1.x`   | Fast Rust-based linter. Already in scaffold.         |
| `eslint`                      | `^9.x`   | Extended linting for security + a11y plugins.        |
| `eslint-plugin-security`      | `^3.x`   | Flags dangerous JS patterns (eval, innerHTML, etc.). |
| `eslint-plugin-jsx-a11y`      | `^6.x`   | Accessibility linting for JSX.                       |
| `prettier`                    | `^3.x`   | Code formatting. Consistent style across the team.   |
| `vitest`                      | `^3.x`   | Unit test runner. Vite-native, fast.                 |
| `@vitest/coverage-v8`         | `^3.x`   | Code coverage via V8.                                |
| `@testing-library/react`      | `^16.x`  | Component testing utilities.                         |
| `@testing-library/user-event` | `^14.x`  | Realistic user interaction simulation in tests.      |
| `@testing-library/jest-dom`   | `^6.x`   | Custom matchers for DOM assertions.                  |
| `jsdom`                       | `^25.x`  | DOM environment for Vitest.                          |

## Build & Prerender Tooling

- `scripts/prerender.mjs`: Built-in Node.js post-build script. Zero new packages. Generates static HTML with Open Graph, meta tags, Schema.org JSON-LD, sitemap.xml, and robots.txt. See ADR-008.

## Explicitly Rejected

| Package                    | Reason                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `puppeteer` / `playwright` | Rejected for prerendering: 300MB+ binary, fragile in sandboxes. See ADR-008.         |
| `prerender.io`             | Rejected: unnecessary paid external SaaS dependency for static data. See ADR-008.    |
| `bootstrap`                | Class + reset conflicts with Tailwind. See ADR-001.                                  |
| `DOMPurify`                | Not needed: no `dangerouslySetInnerHTML` used anywhere. If ever needed, add it then. |
| `axios`                    | Not needed: Starter uses static JSON. Fetch API is sufficient for Business.          |
| `i18next`                  | Not needed: Arabic-only store. If multilingual is added, document here.              |
| `moment` / `date-fns`      | Not needed in Starter. Add `date-fns` only when order timestamps are displayed.      |
