/**
 * Arabic string normalization for resilient search matching:
 * - Removes diacritics (tashkeel) and kashida (tatweel).
 * - Unifies alef variants (أ, إ, آ, ٱ -> ا).
 * - Unifies taa marbuta (ة -> ه).
 * - Unifies alef maqsura (ى -> ي).
 * - Lowercases Latin characters.
 */

// Arabic diacritics / tashkeel range
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/g
const TATWEEL_REGEX = /\u0640/g
const ALEF_REGEX = /[أإآٱ]/g
const TAA_MARBUTA_REGEX = /ة/g
const ALEF_MAQSURA_REGEX = /ى/g

export function normalizeArabic(text: unknown): string {
  if (typeof text !== 'string') return ''

  return text
    .toLowerCase()
    .replace(TASHKEEL_REGEX, '')
    .replace(TATWEEL_REGEX, '')
    .replace(ALEF_REGEX, 'ا')
    .replace(TAA_MARBUTA_REGEX, 'ه')
    .replace(ALEF_MAQSURA_REGEX, 'ي')
    .trim()
}

/**
 * Checks whether the target text contains the search query, applying
 * Arabic normalization and case-insensitivity to both.
 */
export function matchesArabicSearch(target: string | undefined | null, query: string): boolean {
  if (!target || !query) return false

  const normalizedTarget = normalizeArabic(target)
  const normalizedQuery = normalizeArabic(query)

  if (!normalizedQuery) return false

  return normalizedTarget.includes(normalizedQuery)
}
