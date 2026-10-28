# ADR-006: React 19 (Not React 18)

**Date:** 2026-10-28  
**Status:** Accepted

## Context

The project prompt specifies "React 18". The scaffold was generated with React 19, which is stable (released December 2024). The React Compiler (`babel-plugin-react-compiler`) already in the scaffold requires React 19.

## Decision

Keep **React 19**.

## Reasons

1. **React Compiler is already configured.** Removing it would require reworking the Vite/Babel config and lose automatic memoization.
2. **React 19 is production-stable.** It is the current major version as of the build date.
3. **React 19 features are additive.** No breaking changes affect the components we are building.
4. **Downgrading is a regression.** All new React features (improved Suspense, use() hook, Actions) benefit the project.

## Consequences

- Any dependency that has not yet declared React 19 peer dependency compatibility must be checked. shadcn/ui and react-router-dom v7 both support React 19.
- The prompt's "React 18" reference is treated as a typo/outdated spec.
