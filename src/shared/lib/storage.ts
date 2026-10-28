/**
 * Typed, namespaced, versioned localStorage wrapper.
 *
 * Rules:
 * - All keys are prefixed with 'am_' and suffix-versioned (_v1, _v2, etc.).
 * - Reads are strictly validated via Zod schemas. Invalid or corrupted data returns fallback.
 * - Every operation is wrapped in try/catch to survive private browsing, quotas, or disabled storage.
 * - Strictly NO PII or sensitive business credentials stored here.
 */

import { z, type ZodType } from 'zod'

export const STORAGE_PREFIX = 'am_'

export function buildStorageKey(name: string): string {
  return `${STORAGE_PREFIX}${name}`
}

/**
 * Safely reads and validates an item from localStorage.
 */
export function readStorage<T>(key: string, schema: ZodType<T>, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback
    }

    const raw = window.localStorage.getItem(key)
    if (raw === null) {
      return fallback
    }

    const parsedJson = JSON.parse(raw)
    const result = schema.safeParse(parsedJson)

    if (result.success) {
      return result.data
    }

    return fallback
  } catch {
    // SyntaxError on JSON.parse, SecurityError, or disabled storage
    return fallback
  }
}

/**
 * Safely writes an item to localStorage.
 */
export function writeStorage<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }

    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // QuotaExceededError or disabled storage — fail safely without crashing
    return false
  }
}

/**
 * Safely removes an item from localStorage.
 */
export function removeStorage(key: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }

    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

// ── Specific Application Storage Keys & Schemas ───────────────────────────

export const STORAGE_KEYS = {
  PAGE_VISITS: buildStorageKey('page_visits_v1'),
  PWA_DISMISSED: buildStorageKey('pwa_dismissed_v1'),
  LAST_SEARCH: buildStorageKey('last_search_v1'),
  VEHICLE_FILTER: buildStorageKey('vehicle_filter_v1'),
} as const

export const VehicleFilterStorageSchema = z.object({
  modelId: z.string().optional(),
  year: z.number().int().optional(),
  categoryId: z.string().optional(),
})

export type VehicleFilterStorage = z.infer<typeof VehicleFilterStorageSchema>

/**
 * High-level typed storage interface for AZZAB MOTO
 */
export const storage = {
  pageVisits: {
    get: (): number => readStorage(STORAGE_KEYS.PAGE_VISITS, z.number().int().nonnegative(), 0),
    set: (count: number): boolean => writeStorage(STORAGE_KEYS.PAGE_VISITS, count),
    increment: (): number => {
      const next = storage.pageVisits.get() + 1
      storage.pageVisits.set(next)
      return next
    },
    clear: (): boolean => removeStorage(STORAGE_KEYS.PAGE_VISITS),
  },

  pwaDismissed: {
    get: (): boolean => readStorage(STORAGE_KEYS.PWA_DISMISSED, z.boolean(), false),
    set: (dismissed: boolean): boolean => writeStorage(STORAGE_KEYS.PWA_DISMISSED, dismissed),
    clear: (): boolean => removeStorage(STORAGE_KEYS.PWA_DISMISSED),
  },

  lastSearch: {
    get: (): string => readStorage(STORAGE_KEYS.LAST_SEARCH, z.string().max(100), ''),
    set: (query: string): boolean => writeStorage(STORAGE_KEYS.LAST_SEARCH, query.slice(0, 100)),
    clear: (): boolean => removeStorage(STORAGE_KEYS.LAST_SEARCH),
  },

  vehicleFilter: {
    get: (): VehicleFilterStorage =>
      readStorage(STORAGE_KEYS.VEHICLE_FILTER, VehicleFilterStorageSchema, {}),
    set: (filter: VehicleFilterStorage): boolean =>
      writeStorage(STORAGE_KEYS.VEHICLE_FILTER, filter),
    clear: (): boolean => removeStorage(STORAGE_KEYS.VEHICLE_FILTER),
  },
}
