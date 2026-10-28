import { describe, it, expect } from 'vitest'
import {
  buildWhatsAppUrl,
  buildOrderMessage,
  buildPhotoRequestMessage,
  sanitizeWhatsAppMessage,
  MAX_WHATSAPP_MESSAGE_LENGTH,
} from '@/shared/lib/whatsapp'
import { siteConfig } from '@/app/config/site'

describe('WhatsApp URL Builder', () => {
  it('uses the canonical store WhatsApp number from siteConfig', () => {
    const url = buildWhatsAppUrl('مرحبا')
    expect(url).toContain(`https://wa.me/${siteConfig.whatsappNumber}`)
    expect(siteConfig.whatsappNumber).toBe('201141334668')
  })

  it('handles empty string and returns base WhatsApp URL without text param', () => {
    const url = buildWhatsAppUrl('')
    expect(url).toBe(`https://wa.me/${siteConfig.whatsappNumber}`)
  })

  it('handles null/undefined safely', () => {
    // @ts-expect-error testing hostile non-string input
    const urlFromNull = buildWhatsAppUrl(null)
    expect(urlFromNull).toBe(`https://wa.me/${siteConfig.whatsappNumber}`)

    const urlFromUndefined = buildWhatsAppUrl(undefined)
    expect(urlFromUndefined).toBe(`https://wa.me/${siteConfig.whatsappNumber}`)
  })

  it('safely handles hostile inputs with quotes and apostrophes', () => {
    const hostileQuote = `' OR '1'='1" -- `
    const url = buildWhatsAppUrl(hostileQuote)
    expect(url).toContain('wa.me')
    // Quotes must be properly percent-encoded
    expect(url).toContain('%27')
    expect(url).toContain('%22')
    expect(url).not.toContain('"')
  })

  it('safely handles hostile XSS <script> payloads', () => {
    const xss = `<script>alert("PWNED");</script><img src=x onerror=alert(1)>`
    const url = buildWhatsAppUrl(xss)
    // < and > must be percent-encoded
    expect(url).toContain('%3Cscript%3E')
    expect(url).not.toContain('<script>')
    expect(url).not.toContain('</script>')
  })

  it('preserves intentional newlines in message while safely encoding them', () => {
    const multiLine = `سطر أول\nسطر ثاني\r\nسطر ثالث`
    const url = buildWhatsAppUrl(multiLine)
    expect(url).toContain('%0A')
    expect(url).not.toContain('\n')
  })

  it('truncates inputs exceeding 5000 characters to MAX_WHATSAPP_MESSAGE_LENGTH', () => {
    const hugeInput = 'A'.repeat(5000)
    const sanitized = sanitizeWhatsAppMessage(hugeInput)
    expect(sanitized.length).toBe(MAX_WHATSAPP_MESSAGE_LENGTH)

    const url = buildWhatsAppUrl(hugeInput)
    const textParam = new URL(url).searchParams.get('text')
    expect(textParam?.length).toBe(MAX_WHATSAPP_MESSAGE_LENGTH)
  })

  it('safely encodes Arabic and Unicode text and emojis', () => {
    const unicodeInput = 'عزاب موتو — قطع غيار أصلية 🏍️'
    const url = buildWhatsAppUrl(unicodeInput)
    const textParam = new URL(url).searchParams.get('text')
    expect(textParam).toBe(unicodeInput)
  })

  it('strips dangerous null bytes (\\x00)', () => {
    const nullByteInput = 'عزاب\x00موتو\x00قطع'
    const sanitized = sanitizeWhatsAppMessage(nullByteInput)
    expect(sanitized).toBe('عزابموتوقطع')
    expect(sanitized).not.toContain('\x00')
  })

  it('builds structured order message with SKU and price', () => {
    const orderMsg = buildOrderMessage({
      productName: 'تيل فرامل أمامي',
      sku: 'AZB-BRK-001',
      partNumber: 'N9111330',
      price: 380,
    })

    expect(orderMsg).toContain('تيل فرامل أمامي')
    expect(orderMsg).toContain('AZB-BRK-001')
    expect(orderMsg).toContain('N9111330')
    expect(orderMsg).toContain('380 ج.م')
    expect(orderMsg).toContain('هل القطعة متوفرة حالياً؟')

    const url = buildWhatsAppUrl(orderMsg)
    expect(url).toContain(`https://wa.me/${siteConfig.whatsappNumber}?text=`)
  })

  it('builds photo request message properly', () => {
    const photoMsg = buildPhotoRequestMessage()
    expect(photoMsg).toContain('صورتها')
    const url = buildWhatsAppUrl(photoMsg)
    expect(url).toContain(`https://wa.me/${siteConfig.whatsappNumber}?text=`)
  })
})
