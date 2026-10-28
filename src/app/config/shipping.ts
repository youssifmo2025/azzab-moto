/**
 * Governorate & Shipping configuration for AZZAB MOTO.
 * Shipping rates: undefined -> 0.00 (per client instructions: do NOT invent rates).
 */

export const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'القليوبية',
  'الشرقية',
  'الدقهلية',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'كفر الشيخ',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'شمال سيناء',
  'جنوب سيناء',
  'بني سويف',
  'الفيوم',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
] as const

export type EgyptianGovernorate = (typeof EGYPTIAN_GOVERNORATES)[number]

/**
 * Configured shipping fee per governorate.
 * Any governorate without an explicit rate evaluates strictly to 0.
 */
export const GOVERNORATE_SHIPPING_FEES: Partial<Record<EgyptianGovernorate, number>> = {
  // Explicitly defined rates go here. Undefined -> 0.
}

export function getShippingFeeForGovernorate(governorate?: string): number {
  if (!governorate) return 0
  const fee = GOVERNORATE_SHIPPING_FEES[governorate as EgyptianGovernorate]
  return typeof fee === 'number' ? fee : 0
}

