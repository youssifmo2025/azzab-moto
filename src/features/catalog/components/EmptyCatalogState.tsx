import { PackageSearch, MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/shared/lib/whatsapp'

interface EmptyCatalogStateProps {
  query?: string
  onResetFilters?: () => void
}

export function EmptyCatalogState({ query, onResetFilters }: EmptyCatalogStateProps) {
  const whatsappUrl = buildWhatsAppUrl(
    query
      ? `السلام عليكم، أبحث عن قطعة "${query}" ولم أجدها في الكتالوج، هل هي متوفرة لديكم؟`
      : 'السلام عليكم، أبحث عن قطعة غيار محددة غير ظاهرة في الكتالوج.',
  )

  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-border bg-surface p-8 sm:p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-promo text-accent mb-4">
        <PackageSearch className="h-8 w-8" aria-hidden="true" />
      </div>

      <h3 className="font-heading text-lg font-bold text-heading sm:text-xl">
        لم نجد قطع غيار مطابقة للبحث
      </h3>

      <p className="mt-2 max-w-md text-sm text-body">
        {query
          ? `لا توجد نتائج مطابقة لـ "${query}". قد تكون القطعة متوفرة في مخازننا ولكن لم تُضف للكتالوج بعد.`
          : 'جرب تقليل شروط الفلترة أو التواصل مع فريقنا الفني مباشرة للبحث في مستودعاتنا.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-[10px] border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-heading transition hover:bg-alt"
          >
            إلغاء جميع الفلاتر
          </button>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-hover"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span>اسألنا عن القطعة عبر واتساب</span>
        </a>
      </div>
    </div>
  )
}
