import { describe, it, expect } from 'vitest'
import { normalizeArabic, matchesArabicSearch } from '@/shared/utils/arabic'

describe('Arabic Normalization Utility', () => {
  it('removes diacritics / tashkeel marks completely', () => {
    const withTashkeel = 'تَيْلُ فَرَامِلٍ أَصْلِيٌّ'
    expect(normalizeArabic(withTashkeel)).toBe('تيل فرامل اصلي')
  })

  it('removes tatweel / kashida', () => {
    const withTatweel = 'عـــزاب مـــوتـــو'
    expect(normalizeArabic(withTatweel)).toBe('عزاب موتو')
  })

  it('unifies alef variants (أ, إ, آ, ٱ) into bare alef (ا)', () => {
    expect(normalizeArabic('أباتشي')).toBe('اباتشي')
    expect(normalizeArabic('إطارات')).toBe('اطارات')
    expect(normalizeArabic('آلات')).toBe('الات')
  })

  it('unifies taa marbuta (ة) to haa (ه)', () => {
    expect(normalizeArabic('قطعة')).toBe('قطعه')
    expect(normalizeArabic('أصلية')).toBe('اصليه')
  })

  it('unifies alef maqsura (ى) to yaa (ي)', () => {
    expect(normalizeArabic('مهوى')).toBe('مهوي')
  })

  it('lowercases Latin characters', () => {
    expect(normalizeArabic('TVS Apache RTR 160 4V')).toBe('tvs apache rtr 160 4v')
  })

  it('handles null, undefined, and non-string inputs safely', () => {
    expect(normalizeArabic(null)).toBe('')
    expect(normalizeArabic(undefined)).toBe('')
    expect(normalizeArabic(12345)).toBe('')
  })
})

describe('matchesArabicSearch', () => {
  it('matches target regardless of alef variations', () => {
    // Target has hamza below, query has bare alef
    expect(matchesArabicSearch('إطار تيوبلس', 'اطار')).toBe(true)
    // Target has bare alef, query has hamza above
    expect(matchesArabicSearch('اصلي', 'أصلي')).toBe(true)
  })

  it('matches target regardless of taa marbuta vs haa', () => {
    expect(matchesArabicSearch('بطارية جافة', 'جافه')).toBe(true)
    expect(matchesArabicSearch('قطعه غيار', 'قطعة')).toBe(true)
  })

  it('matches target with tashkeel against plain query', () => {
    expect(matchesArabicSearch('فِلْتَر زَيْتٍ', 'فلتر')).toBe(true)
  })

  it('matches English terms case-insensitively', () => {
    expect(matchesArabicSearch('TVS Eurogrip Front Tire', 'eurogrip')).toBe(true)
    expect(matchesArabicSearch('AZB-BRK-001', 'brk')).toBe(true)
  })

  it('returns false for empty query or target', () => {
    expect(matchesArabicSearch('', 'فلتر')).toBe(false)
    expect(matchesArabicSearch('تيل فرامل', '')).toBe(false)
  })
})
