/**
 * Site configuration for AZZAB MOTO.
 * Single source of truth for all store metadata and contact coordinates.
 *
 * NOTE: This configuration ships in the client bundle and must never contain secrets.
 */
export const siteConfig = {
  name: 'عزاب موتو',
  nameEn: 'AZZAB MOTO',
  tagline: 'قطع غيار TVS الأصلية',
  description:
    'متجر قطع غيار دراجات TVS النارية — قطع أصلية بأسعار تنافسية مع التوصيل لجميع المحافظات',

  /**
   * WhatsApp business number in international format (Egypt country code 20)
   * Formatted specifically for wa.me links without '+' prefix or spaces: 201141334668
   */
  whatsappNumber: '201141334668',

  /**
   * Local phone number for display in the header and footer
   */
  phone: '01141334668',

  /**
   * Local phone number formatted for Arabic UI display
   */
  whatsappDisplay: '01141334668',

  /**
   * Geographic location
   */
  address: 'مصر',

  /**
   * Authorized dealer badge flag.
   * MUST remain false until formal TVS Egypt dealer agreement is confirmed.
   * When false, the "وكيل معتمد TVS" badge is hidden in the UI.
   */
  isAuthorizedDealer: false,

  /**
   * Rotating announcement messages for the top header strip
   */
  announcements: ['الدفع عند الاستلام', 'خصم خاص للورش ومراكز الصيانة', 'شحن لكل المحافظات'],

  /**
   * Canonical URL for SEO and Open Graph
   */
  siteUrl: import.meta.env?.VITE_SITE_URL ?? 'https://azzabmoto.com',

  /**
   * Currency config
   */
  currency: 'EGP',
  currencySymbol: 'ج.م',
} as const

export type SiteConfig = typeof siteConfig
