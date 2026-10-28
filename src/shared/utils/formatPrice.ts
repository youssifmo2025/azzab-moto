export interface FormatPriceOptions {
  /** Include 'ج.م' currency symbol. Defaults to true. */
  showCurrency?: boolean
  /**
   * Use Latin digits (0-9) for monospace/tabular alignment in IBM Plex Mono.
   * Defaults to true as specified in design brief.
   */
  useLatinDigits?: boolean
  /** Show two fraction decimal digits. Defaults to false for whole pound pricing. */
  showDecimals?: boolean
}

/**
 * Formats a price in Egyptian Pounds (EGP / ج.م) using Arabic locale conventions
 * with tabular numeric digits for vertical alignment in tables and cards.
 *
 * @param amount - Price in Egyptian Pounds
 * @param options - Formatting customization options
 * @returns Formatted localized string (e.g. "1,250 ج.م")
 */
export function formatPrice(amount: number, options: FormatPriceOptions = {}): string {
  const { showCurrency = true, useLatinDigits = true, showDecimals = false } = options

  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return showCurrency ? '0 ج.م' : '0'
  }

  // Use 'ar-EG-u-nu-latn' to keep Arabic grouping/separators while using Latin tabular digits
  const locale = useLatinDigits ? 'ar-EG-u-nu-latn' : 'ar-EG'

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })

  const formattedNumber = formatter.format(amount)

  if (!showCurrency) {
    return formattedNumber
  }

  return `${formattedNumber} ج.م`
}
