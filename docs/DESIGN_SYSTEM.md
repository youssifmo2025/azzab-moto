# AZZAB MOTO — Design System (Light Showroom Edition)

Source of truth: `docs/design-brief.md` and `src/styles/tokens.css`.

---

## 1. Design Tokens

All visual tokens are defined once in `src/styles/tokens.css` as CSS custom properties on `:root`, mapped into the Tailwind v4 theme engine via `@theme` in `src/styles/global.css`, and bound to the shadcn/ui CSS variable naming convention.

### 1.1 Color Palette

| Token Name             | Hex       | Tailwind Utility     | Role & Usage                                                    |
| ---------------------- | --------- | -------------------- | --------------------------------------------------------------- |
| `--color-base`         | `#FFFDF9` | `bg-base`            | Warm off-white primary page background                          |
| `--color-alt`          | `#F6F1EA` | `bg-alt`             | Alternating section backgrounds, drawer, and footer             |
| `--color-surface`      | `#FFFFFF` | `bg-surface`         | Card surface, modal dialogs, and popovers                       |
| `--color-promo`        | `#FFF3E6` | `bg-promo`           | Light orange promotional banner / workshop strip                |
| `--color-border`       | `#ECE6DD` | `border-border`      | Hairline borders, dividers, and card outlines                   |
| `--color-heading`      | `#2B2B2B` | `text-heading`       | High-contrast charcoal for headings (H1–H6)                     |
| `--color-body`         | `#6B6560` | `text-body`          | Warm muted grey for readable body paragraphs and descriptions   |
| `--color-accent`       | `#FF8200` | `bg-accent`, `text-` | TVS brand orange: strictly for primary CTA buttons and prices   |
| `--color-accent-hover` | `#E67300` | `hover:bg-...`       | Darker orange hover state for accent buttons                    |
| `--color-secondary`    | `#5B7083` | `text-secondary`     | Slate grey-blue for secondary links, breadcrumbs, outline icons |
| `--color-success`      | `#3E8E5E` | `text-success`       | Olive green indicator for in-stock and vehicle compatibility    |
| `--color-error`        | `#C0392B` | `text-error`         | Semantic error messages and invalid form states                 |
| `--color-warning`      | `#D97706` | `text-warning`       | Semantic warning messages                                       |

### 1.2 shadcn/ui Theme Variable Mapping

shadcn components automatically inherit the brand palette through CSS variable redirection in `:root`:

- `--background` -> `var(--color-base)` (`#FFFDF9`)
- `--foreground` -> `var(--color-heading)` (`#2B2B2B`)
- `--card` -> `var(--color-surface)` (`#FFFFFF`)
- `--primary` -> `var(--color-accent)` (`#FF8200`)
- `--primary-foreground` -> `#FFFFFF`
- `--secondary` -> `var(--color-alt)` (`#F6F1EA`)
- `--muted` -> `var(--color-alt)`
- `--muted-foreground` -> `var(--color-secondary)` (`#5B7083`)
- `--accent` -> `var(--color-promo)` (`#FFF3E6`)
- `--destructive` -> `var(--color-error)` (`#C0392B`)
- `--border` & `--input` -> `var(--color-border)` (`#ECE6DD`)
- `--ring` -> `var(--color-accent)` (`#FF8200`)
- `--radius` -> `10px`

### 1.3 Spacing & Radii

- **Base Radius:** `10px` (`--radius: 10px`), with `--radius-sm: 6px` for small tags/inputs and `--radius-lg: 16px` for modal cards.
- **Section Spacing:** `4rem` (64px) desktop separation, `2.5rem` (40px) mobile.
- **Container Padding:** `1.5rem` (24px) standard horizontal gutter.

### 1.4 Soft Shadows

As dictated by the showroom design brief, heavy permanent box shadows are strictly avoided. Soft shadows appear **only on hover**:

- `--shadow-card-hover: 0 4px 16px 0 rgba(43, 43, 43, 0.08);`
- `--shadow-dropdown: 0 8px 24px 0 rgba(43, 43, 43, 0.12);`
- Utility: `.hover-card-shadow` triggers 4px lift (`translateY(-4px)`) and soft shadow on hover with smooth cubic-bezier transition.

---

## 2. Typography

All fonts are self-hosted via `@fontsource` packages (zero external Google Fonts CDN calls, compliant with GDPR and offline resilience — see `docs/ADR/ADR-004-self-hosted-fonts.md`).

### 2.1 Font Families

| Role              | Font Family          | Weights Loaded              | Utility Class               | Usage                                                   |
| ----------------- | -------------------- | --------------------------- | --------------------------- | ------------------------------------------------------- |
| **Headings**      | Tajawal              | 800 (ExtraBold)             | `.font-heading`             | Page titles, hero headlines, section titles (H1–H6)     |
| **Body Text**     | IBM Plex Sans Arabic | 400 (Regular), 500 (Medium) | `.font-body`                | Paragraphs, product descriptions, menu items, UI labels |
| **Numeric & SKU** | IBM Plex Mono        | 400 (Regular)               | `.font-numeric`, `.tabular` | Prices, SKU codes, OEM part numbers, year ranges        |

### 2.2 Tabular Numbers (`.tabular` / `.font-numeric`)

Prices, part numbers, and quantities use monospaced figures with `font-variant-numeric: tabular-nums`. This prevents layout shifts when prices update and ensures vertical digit alignment in tables and product lists:

```html
<span class="font-numeric tabular text-accent font-bold"> 1,250 ج.م </span>
```

### 2.3 RTL Rules

- HTML root is configured with `<html lang="ar" dir="rtl">`.
- Always use CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`).
- Never use directional physical utilities (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`).
