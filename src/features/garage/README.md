# Garage Feature (Premium Package)

This folder is a stub. The garage feature is disabled in Starter and Business (`features.garage = false`).

## To enable for Premium

1. Set `garage: true` in `src/app/config/features.ts`
2. Requires `features.accounts = true` (Business) as a prerequisite
3. Follow the step-by-step guide in `docs/ADDING_A_FEATURE.md`

## What goes here

- `components/` — GaragePage, VehicleCard, AddVehicleForm
- `hooks/` — useGarage.ts
- `types.ts` — SavedVehicle Zod schema
- `index.ts` — public API

## Purpose

Allows users to save their motorcycle models and get filtered part results
without re-selecting model/year every visit.
