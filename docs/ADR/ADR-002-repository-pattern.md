# ADR-002: Repository Pattern for Data Access

**Date:** 2026-10-28  
**Status:** Accepted

## Context

Starter Store uses static JSON files for product/category/model data. Business and Premium packages will use a backend REST or GraphQL API. We need a clean migration path.

## Decision

Use the **Repository pattern**: define TypeScript interfaces (`ProductRepository`, `CategoryRepository`, `VehicleRepository`) and implement them with `JsonRepository` now. UI code calls the interfaces only.

## Reasons

1. **Zero UI changes on API migration.** Replacing `JsonProductRepository` with `ApiProductRepository` requires touching only `src/services/` — no component changes.
2. **Testability.** Hooks can be tested with a `MockProductRepository` that returns deterministic data.
3. **Clear ownership.** The interface is the contract; the implementation is the detail.
4. **Encourages async thinking from day one.** Even the JSON implementation returns `Promise<T>`, so components are already written for async data.

## Consequences

- Slightly more boilerplate than direct `import data from './products.json'`.
- All feature hooks must go through the repository, not import JSON directly. This is enforced by code review.
