import { describe, it, expect } from 'vitest'
import { sanitizeSearch, MAX_SEARCH_LENGTH } from '@/shared/utils/sanitizeSearch'
import {
  CatalogQueryParamsSchema,
  parseCatalogQueryParams,
} from '@/features/catalog/schemas/catalog-params.schema'
import {
  buildWhatsAppUrl,
  sanitizeWhatsAppMessage,
  MAX_WHATSAPP_MESSAGE_LENGTH,
} from '@/shared/lib/whatsapp'
import { siteConfig } from '@/app/config/site'

describe('Security: Hostile Input Hardening', () => {
  describe('Search Input Sanitization', () => {
    it('strips malicious <script> tags and payloads', () => {
      const input = '<script>alert("XSS")</script>تيل فرامل'
      const sanitized = sanitizeSearch(input)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('</script>')
      expect(sanitized).toContain('تيل فرامل')
    })

    it('strips HTML event handlers and iframe tags', () => {
      const input =
        '<img src=x onerror="alert(document.cookie)"><iframe src="https://evil.com"></iframe>فلتر'
      const sanitized = sanitizeSearch(input)
      expect(sanitized).not.toContain('<img')
      expect(sanitized).not.toContain('onerror')
      expect(sanitized).not.toContain('<iframe')
      expect(sanitized).toContain('فلتر')
    })

    it('replaces null bytes and non-printable control characters safely', () => {
      const input = 'تيل\x00فرامل\x08أصلي\x1F'
      const sanitized = sanitizeSearch(input)
      expect(sanitized).not.toContain('\x00')
      expect(sanitized).not.toContain('\x08')
      expect(sanitized).not.toContain('\x1F')
      expect(sanitized).toBe('تيل فرامل أصلي')
    })

    it('neutralizes unicode bidi directional override characters', () => {
      // \u202E is Right-To-Left Override (often used for spoofing file extensions)
      const input = 'تيل\u202Eexe.lmth\u202C فرامل'
      const sanitized = sanitizeSearch(input)
      expect(sanitized).not.toContain('\u202E')
      expect(sanitized).not.toContain('\u202C')
    })

    it('caps massive inputs to MAX_SEARCH_LENGTH characters', () => {
      const massive = 'بوجيه'.repeat(1000)
      const sanitized = sanitizeSearch(massive)
      expect(sanitized.length).toBeLessThanOrEqual(MAX_SEARCH_LENGTH)
      expect(sanitized.length).toBe(MAX_SEARCH_LENGTH)
    })

    it('safely handles non-string and malformed inputs', () => {
      // sanitizeSearch accepts `unknown` — all non-string values must return ''
      expect(sanitizeSearch(null as unknown)).toBe('')
      expect(sanitizeSearch(undefined as unknown)).toBe('')
      expect(sanitizeSearch(12345 as unknown)).toBe('')
      expect(sanitizeSearch({ malicious: true } as unknown)).toBe('')
      expect(sanitizeSearch(['<script>'] as unknown)).toBe('')
    })

    it('neutralizes path traversal patterns', () => {
      const input = '../../../../etc/passwd'
      const sanitized = sanitizeSearch(input)
      expect(sanitized).not.toContain('../')
      expect(sanitized).not.toContain('..\\')
    })
  })

  describe('URL Query Parameter Validation (CatalogQueryParamsSchema)', () => {
    it('rejects prototype pollution attempts gracefully without throwing', () => {
      const params = new URLSearchParams()
      params.set('__proto__', 'polluted')
      params.set('constructor', 'polluted')

      const parsed = parseCatalogQueryParams(params)
      expect(parsed).toBeDefined()
      expect(Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted')).toBe(false)
    })

    it('safely falls back when hostile or non-numeric year is supplied', () => {
      const hostileYears = ['-999', '0', 'NaN', '99999999999', '<script>', '2024;DROP TABLE']

      for (const y of hostileYears) {
        const params = new URLSearchParams({ year: y })
        const parsed = parseCatalogQueryParams(params)
        // Invalid year must safely fall back to undefined
        expect(parsed.year).toBeUndefined()
      }
    })

    it('safely rejects malicious or unknown sort values', () => {
      const hostileSorts = [
        'price_desc;DELETE FROM products',
        'eval(alert(1))',
        '__proto__',
        'admin',
      ]

      for (const s of hostileSorts) {
        const params = new URLSearchParams({ sort: s })
        const parsed = parseCatalogQueryParams(params)
        // Invalid sort safely falls back to default schema fallback
        expect(parsed.sort).toBe('name_asc')
      }
    })

    it('safely trims and sanitizes search query in query params', () => {
      const params = new URLSearchParams({ q: '   <script>alert(1)</script>بطارية   ' })
      const parsed = parseCatalogQueryParams(params)
      expect(parsed.q).not.toContain('<script>')
      expect(parsed.q).toContain('بطارية')
    })

    it('rejects massive query strings in URL params safely', () => {
      const massive = 'a'.repeat(5000)
      const result = CatalogQueryParamsSchema.safeParse({ q: massive })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.q?.length).toBeLessThanOrEqual(MAX_SEARCH_LENGTH)
      }
    })
  })

  describe('WhatsApp URL Builder Security', () => {
    it('strictly binds to canonical siteConfig phone and cannot be redirected', () => {
      // Attacker tries to inject another recipient number via message
      const hostileMessage = 'سلام&phone=201234567890'
      const url = buildWhatsAppUrl(hostileMessage)

      // The canonical destination must always be the configured number
      expect(url.startsWith(`https://wa.me/${siteConfig.whatsappNumber}?text=`)).toBe(true)
      // The & must be percent-encoded to prevent parameter injection
      expect(url).toContain('%26phone%3D')
      expect(url).not.toContain('&phone=201234567890')
    })

    it('safely encodes CRLF header injection attempts in WhatsApp messages', () => {
      const hostileCrlf = 'Message\r\nBcc: victim@example.com\r\n\r\nInjected'
      const sanitized = sanitizeWhatsAppMessage(hostileCrlf)
      // sanitizeWhatsAppMessage permits \r and \n but buildWhatsAppUrl encodes them
      const url = buildWhatsAppUrl(sanitized)
      expect(url).not.toContain('\r\nBcc')
      expect(url).toContain('%0D%0A')
    })

    it('caps message length strictly to MAX_WHATSAPP_MESSAGE_LENGTH', () => {
      const massiveMessage = 'قطعة غيار '.repeat(500)
      const sanitized = sanitizeWhatsAppMessage(massiveMessage)
      expect(sanitized.length).toBeLessThanOrEqual(MAX_WHATSAPP_MESSAGE_LENGTH)
    })
  })
})
