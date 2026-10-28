# ADR-005: Feature Flags as Compile-Time Constants

**Date:** 2026-10-28  
**Status:** Accepted

## Context

The Starter Store must not expose UI for Business/Premium features (cart, accounts, checkout, payments). We need a mechanism to disable features cleanly.

## Decision

Feature flags are **TypeScript `const` objects** in `src/app/config/features.ts` — not environment variables, not a remote feature flag service, not runtime state.

## Reasons

1. **Tree-shaking.** A `const false` flag means the bundler eliminates all code behind `if (features.cart)` checks. Zero dead code in the bundle.
2. **Simplicity.** No SDK, no network request, no race condition waiting for flags to load.
3. **Type safety.** `as const` means TypeScript knows the exact boolean value at compile time.
4. **Security.** There is no way for a user to enable a disabled feature at runtime by manipulating state.
5. **Audit trail.** Enabling a Business feature requires a code change → pull request → review. No silent flag flip.

## Consequences

- Feature flags cannot be toggled without a deployment. This is intentional for Starter.
- Business package will either keep this approach or add a lightweight remote config (documented in ADDING_A_FEATURE.md).
