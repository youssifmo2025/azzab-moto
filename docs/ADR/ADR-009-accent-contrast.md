# ADR-009: Accent Color Contrast — Accessible Orange for Text

## Status

Accepted

## Context

The design brief specifies `#FF8200` (TVS brand orange) as the accent color. When used as **text on white** (`#FFFFFF`) backgrounds, its WCAG 2.1 contrast ratio is approximately **2.49:1**, which fails:

- **AA Normal text** (requires 4.5:1)
- **AA Large text** (requires 3:1 — 18px+ regular or 14px+ bold)

The brief itself limits orange to "primary buttons, prices, and key marks," but multiple UI elements use `text-accent` at sizes below 18px.

## Decision

Introduce a **two-tone accent system**:

| Token                 | Hex       | Use Case                                                                                                                                                                     | Contrast on White    |
| --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `--color-accent`      | `#FF8200` | Filled button backgrounds (white text on orange = ~4.5:1 ✅), decorative large/bold text (≥24px extrabold), and non-text UI elements (borders, icons alongside text labels). | N/A (background use) |
| `--color-accent-text` | `#B45300` | Small text on light backgrounds: prices, badges, links, labels below 18px.                                                                                                   | **4.87:1** ✅ AA     |

The `text-accent` Tailwind utility is remapped to `--color-accent-text` so all text usage is automatically accessible. Background usage (`bg-accent`) retains the original `#FF8200`.

## Consequences

- **Positive**: All text now meets WCAG AA. Prices, labels, and links are readable without squinting. No visual disruption — the darkened orange is perceptually close to the logo color.
- **Negative**: Slight visual divergence between button fill color and text color. Acceptable — this is standard practice (e.g., Google's blue link vs. blue button).
