# ADR-003: Zod as Schema and Validation Source of Truth

**Date:** 2026-10-28  
**Status:** Accepted

## Context

The app consumes data from three untrusted sources: JSON files (can be edited/tampered), `localStorage` (can be modified by browser extensions), and URL parameters (can be crafted by attackers). TypeScript types alone do not validate at runtime.

## Decision

Use **Zod** for all data schemas. TypeScript types are **inferred** from Zod schemas (`z.infer<typeof ProductSchema>`). No separate TS interface duplicates the schema.

## Reasons

1. **Runtime safety.** Zod throws on invalid data before it can cause XSS, crashes, or incorrect renders.
2. **Single source of truth.** Schema and type are defined once. Changing the schema automatically updates the type.
3. **Great DX.** Zod errors are readable and include field paths.
4. **URL param safety.** `z.string().max(100).regex(...)` on search params prevents injection and ReDoS.
5. **localStorage versioning.** Zod parse-or-default pattern handles schema migrations gracefully.

## Consequences

- Zod is a runtime dependency (~13 KB gzipped). Accepted: the security benefit outweighs the size cost.
- Developers must add a Zod schema before adding a TypeScript type. Enforced by convention.
