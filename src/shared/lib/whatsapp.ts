/**
 * WhatsApp URL builder — single centralized builder for wa.me links.
 *
 * Security & Reliability Rules:
 * - Phone number ALWAYS comes from siteConfig, never user input.
 * - Message is sanitized (null-byte stripped, length capped) and passed through encodeURIComponent.
 * - Links open with target="_blank" rel="noopener noreferrer".
 * - Fully tested with hostile input (XSS payloads, control characters, huge inputs, unicode).
 */

import { siteConfig } from '@/app/config/site'

export const MAX_WHATSAPP_MESSAGE_LENGTH = 1000

/**
 * Strips null bytes and control characters (except newline \n and carriage return \r),
 * and caps message length to MAX_WHATSAPP_MESSAGE_LENGTH characters.
 */
export function sanitizeWhatsAppMessage(message: unknown): string {
  if (typeof message !== 'string') return ''

  // Strip null bytes and non-printable ASCII control characters (keep \r and \n)
  // eslint-disable-next-line no-control-regex
  const stripped = message.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')

  return stripped.slice(0, MAX_WHATSAPP_MESSAGE_LENGTH)
}

/**
 * Builds a secure wa.me URL for the store's WhatsApp number.
 *
 * @param message - Optional prefilled message text
 * @returns Fully formatted wa.me URL
 */
export function buildWhatsAppUrl(message: string = ''): string {
  const sanitized = sanitizeWhatsAppMessage(message)
  const phone = siteConfig.whatsappNumber

  if (!sanitized) {
    return `https://wa.me/${phone}`
  }

  const encoded = encodeURIComponent(sanitized).replace(/'/g, '%27')
  return `https://wa.me/${phone}?text=${encoded}`
}

export interface OrderMessageParams {
  productName: string
  sku: string
  partNumber?: string
  price?: number
  productUrl?: string
}

/**
 * Builds a structured Arabic WhatsApp order message for a specific product.
 */
export function buildOrderMessage(params: OrderMessageParams): string {
  const { productName, sku, partNumber, price, productUrl } = params
  const lines: string[] = [
    'السلام عليكم، أريد الاستفسار عن قطعة غيار:',
    `• الاسم: ${productName}`,
    `• كود القطعة (SKU): ${sku}`,
  ]

  if (partNumber && partNumber.trim().length > 0) {
    lines.push(`• رقم القطعة الأصلي: ${partNumber.trim()}`)
  }

  if (typeof price === 'number' && price > 0) {
    lines.push(`• السعر: ${price} ج.م`)
  }

  if (productUrl && productUrl.trim().length > 0) {
    lines.push(`• رابط القطعة: ${productUrl.trim()}`)
  }

  lines.push('هل القطعة متوفرة حالياً؟')
  return lines.join('\n')
}

/**
 * Builds a prefilled WhatsApp message for the "Send Part Photo" flow.
 */
export function buildPhotoRequestMessage(): string {
  return 'السلام عليكم، أبحث عن قطعة غيار ولا أعرف اسمها بدقة. سأرسل لكم صورتها للمساعدة.'
}
