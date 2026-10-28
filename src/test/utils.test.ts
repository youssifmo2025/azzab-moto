import { describe, it, expect } from 'vitest'
import { sanitizeSearch, MAX_SEARCH_LENGTH } from '@/shared/utils/sanitizeSearch'
import { formatPrice } from '@/shared/utils/formatPrice'
import { cn } from '@/shared/utils/cn'

describe('sanitizeSearch', () => {
  it('preserves clean Arabic and alphanumeric queries', () => {
    expect(sanitizeSearch('تيل فرامل TVS HLX 150')).toBe('تيل فرامل TVS HLX 150')
    expect(sanitizeSearch('فلتر زيت 2022')).toBe('فلتر زيت 2022')
  })

  it('handles empty and whitespace-only input', () => {
    expect(sanitizeSearch('')).toBe('')
    expect(sanitizeSearch('   ')).toBe('')
    expect(sanitizeSearch(null)).toBe('')
    expect(sanitizeSearch(undefined)).toBe('')
  })

  it('strips dangerous HTML and script tags', () => {
    expect(sanitizeSearch('<script>alert("XSS")</script>')).toBe('alert("XSS")')
    expect(sanitizeSearch('<img src=x onerror=alert(1)>بوجيه')).toBe('بوجيه')
    expect(sanitizeSearch('<div><p>فلتر</p></div>')).toBe('فلتر')
  })

  it('strips stray angle brackets', () => {
    expect(sanitizeSearch('<<تيل>>')).toBe('تيل')
    expect(sanitizeSearch('5 < 10')).toBe('5 10')
  })

  it('collapses multiple whitespace, tabs, and newlines into single spaces', () => {
    expect(sanitizeSearch('تيل \t\t فرامل \n\n خلفي')).toBe('تيل فرامل خلفي')
  })

  it('strips null bytes (\\x00) and control characters', () => {
    expect(sanitizeSearch('أباتشي\x00160\x1Fقطع')).toBe('أباتشي 160 قطع')
  })

  it('truncates inputs exceeding 5000 characters to MAX_SEARCH_LENGTH (100)', () => {
    const hugeQuery = 'قطع '.repeat(1000)
    const sanitized = sanitizeSearch(hugeQuery)
    expect(sanitized.length).toBeLessThanOrEqual(MAX_SEARCH_LENGTH)
  })

  it('preserves quotes and search symbols without breaking', () => {
    const query = sanitizeSearch('"HLX 150"')
    expect(query).toBe('"HLX 150"')
  })
})

describe('formatPrice', () => {
  it('formats whole numbers in EGP with currency symbol and tabular Latin digits by default', () => {
    const formatted = formatPrice(380)
    expect(formatted).toContain('380')
    expect(formatted).toContain('ج.م')
  }, 15000)

  it('formats large numbers with proper grouping separator', () => {
    const formatted = formatPrice(12500)
    expect(formatted).toContain('12,500')
    expect(formatted).toContain('ج.م')
  })

  it('formats 0 EGP properly', () => {
    expect(formatPrice(0)).toContain('0')
    expect(formatPrice(0)).toContain('ج.م')
  })

  it('can format without currency symbol', () => {
    const formatted = formatPrice(450, { showCurrency: false })
    expect(formatted).toBe('450')
  })

  it('supports Arabic-Indic numerals when useLatinDigits is false', () => {
    const formatted = formatPrice(150, { useLatinDigits: false })
    expect(formatted).toContain('١٥٠')
    expect(formatted).toContain('ج.م')
  })

  it('handles fractional prices when showDecimals is true', () => {
    const formatted = formatPrice(250.5, { showDecimals: true })
    expect(formatted).toContain('250.50')
  })

  it('safely handles non-numbers and NaN', () => {
    expect(formatPrice(NaN)).toBe('0 ج.م')
    // @ts-expect-error testing invalid input
    expect(formatPrice(undefined)).toBe('0 ج.م')
  })
})

describe('cn (Class Names utility)', () => {
  it('combines string class names', () => {
    expect(cn('class-a', 'class-b')).toBe('class-a class-b')
  })

  it('handles conditional truthy and falsy values', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled', undefined, null)).toBe(
      'btn btn-active',
    )
  })

  it('handles object maps of classes', () => {
    expect(cn('base', { 'is-active': true, 'is-hidden': false })).toBe('base is-active')
  })

  it('handles nested arrays', () => {
    expect(cn(['one', ['two', false, 'three']])).toBe('one two three')
  })
})
