# ADR-007: Linting Strategy (Oxlint + ESLint Flat Config + Prettier)

## Status

Accepted

## Context

The project is built on TypeScript (strict mode) with React 19 and Vite. Standard ESLint requires `@typescript-eslint/parser` and associated AST plugins to parse TypeScript syntax (`interface`, `type`, `as const`, type annotations). Without these plugins, ESLint's default `espree` parser throws syntax errors on all TypeScript files.

However, `@typescript-eslint` introduces heavy dependency weight and slower lint times in CI/CD. Meanwhile, `oxlint` (a Rust-based linter) provides native, zero-config TypeScript and JSX analysis in under 50ms, with built-in rules for React, Hooks, JSX a11y, and general correctness.

## Decision

We retain `oxlint` as the primary TypeScript/TSX linter, complemented by ESLint 9 flat config for security and a11y rules on JavaScript files, and Prettier for code formatting:

1. `oxlint src` runs on all source files (`.ts`, `.tsx`), validating React rules and TypeScript idioms at sub-100ms speed.
2. `eslint` flat config runs alongside it to enforce security plugins and project-level rules.
3. Prettier maintains formatting consistency across all code, markdown, and config files.

## Consequences

- Fast developer feedback loop during build and commit hooks.
- No heavy parser overhead for everyday linting.
- If deep type-aware linting (e.g. `no-floating-promises`) is required in Phase 7/Business tier, `@typescript-eslint` can be evaluated with project service mode.
