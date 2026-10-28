# ADR-001: No Bootstrap

**Date:** 2026-10-28  
**Status:** Accepted

## Context

The project uses **Tailwind CSS v4** as its utility framework and **shadcn/ui** for base components. Bootstrap was suggested as an alternative.

## Decision

Do **not** install Bootstrap.

## Reasons

1. **Class conflicts.** Bootstrap ships its own utility classes (`text-center`, `d-flex`, etc.) that clash with Tailwind utilities of the same name. The result is unpredictable cascade order and hard-to-debug visual bugs.
2. **Reset conflicts.** Bootstrap's `_reboot.scss` and Tailwind's `@base` layer both reset element styles. Layering both produces double-reset artifacts.
3. **Bundle weight.** Bootstrap adds ~30 KB (gzipped) of CSS that would be 90%+ unused, worsening Lighthouse Performance scores.
4. **shadcn/ui is already Tailwind-native.** All interactive components (dialogs, drawers, selects) are already provided by shadcn. Bootstrap would duplicate this.
5. **No benefit.** Every Bootstrap component we could use has a Tailwind + shadcn equivalent with better RTL support.

## Consequences

- Developers must use Tailwind utility classes only (no Bootstrap shortcuts).
- shadcn/ui is the component library of record.
