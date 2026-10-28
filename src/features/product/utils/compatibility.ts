import type { Compatibility } from '@/services/schemas/product'

export interface CompatibilityCheckResult {
  /** True when a motorcycle model has been selected for checking */
  isChecked: boolean
  /** True when the selected model (and optional year) is confirmed compatible */
  isCompatible: boolean
  /** Matched compatibility entry if compatible */
  matchedRange?: { yearFrom: number; yearTo: number }
}

/**
 * Evaluates whether a product is mechanically compatible with a given TVS model and production year.
 *
 * @param compatibilityList - Product's compatibility definitions from data schema
 * @param selectedModelId - The user-selected model ID (e.g. 'model-hlx-150')
 * @param selectedYear - Optional production year (e.g. 2022)
 */
export function checkProductCompatibility(
  compatibilityList: Compatibility[] | undefined | null,
  selectedModelId?: string,
  selectedYear?: number,
): CompatibilityCheckResult {
  if (!compatibilityList || !selectedModelId) {
    return { isChecked: false, isCompatible: false }
  }

  const match = compatibilityList.find((item) => {
    if (item.modelId !== selectedModelId) return false
    if (typeof selectedYear === 'number' && !Number.isNaN(selectedYear)) {
      return selectedYear >= item.yearFrom && selectedYear <= item.yearTo
    }
    return true
  })

  if (match) {
    return {
      isChecked: true,
      isCompatible: true,
      matchedRange: { yearFrom: match.yearFrom, yearTo: match.yearTo },
    }
  }

  return {
    isChecked: true,
    isCompatible: false,
  }
}
