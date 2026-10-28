import { useCategories } from '@/features/catalog/hooks/useCategories'
import { useModels } from '@/features/vehicle-selector/hooks/useModels'
import type { CatalogQueryParams } from '../schemas/catalog-params.schema'
import { X, RotateCcw, Filter } from 'lucide-react'

interface CatalogFiltersProps {
  filters: CatalogQueryParams
  onFilterChange: (newFilters: Partial<CatalogQueryParams>) => void
  onReset: () => void
  isMobileModal?: boolean
  onCloseMobileModal?: () => void
}

export function CatalogFilters({
  filters,
  onFilterChange,
  onReset,
  isMobileModal = false,
  onCloseMobileModal,
}: CatalogFiltersProps) {
  const { categories } = useCategories()
  const { models } = useModels()

  const selectedModel = models.find((m) => m.id === filters.modelId)
  const availableYears = selectedModel ? [...selectedModel.years].sort((a, b) => b - a) : []

  const hasActiveFilters = Boolean(
    filters.categoryId || filters.modelId || filters.year || filters.q,
  )

  const content = (
    <div className="space-y-6">
      {/* Header if mobile */}
      {isMobileModal && (
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="font-heading text-lg font-bold text-heading">تصفية المنتجات</h2>
          </div>
          <button
            type="button"
            onClick={onCloseMobileModal}
            aria-label="إغلاق التصفية"
            className="rounded-[8px] p-1.5 text-secondary hover:bg-alt hover:text-heading"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Model Filter */}
      <div>
        <label htmlFor="filter-model" className="mb-2 block text-xs font-bold text-heading">
          الموديل المتوافق
        </label>
        <select
          id="filter-model"
          value={filters.modelId || ''}
          onChange={(e) => {
            onFilterChange({
              modelId: e.target.value || undefined,
              year: undefined, // reset year when model changes
              page: 1,
            })
          }}
          className="w-full rounded-[10px] border border-border bg-base p-2.5 text-sm text-heading transition focus:border-accent focus:outline-none"
        >
          <option value="">جميع الموديلات</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Year Filter */}
      <div>
        <label htmlFor="filter-year" className="mb-2 block text-xs font-bold text-heading">
          سنة الصنع
        </label>
        <select
          id="filter-year"
          value={filters.year || ''}
          onChange={(e) => {
            onFilterChange({
              year: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            })
          }}
          disabled={!filters.modelId}
          className="w-full rounded-[10px] border border-border bg-base p-2.5 text-sm text-heading transition focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">جميع السنوات</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Category List */}
      <div>
        <span className="mb-2.5 block text-xs font-bold text-heading">القسم</span>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onFilterChange({ categoryId: undefined, page: 1 })}
            className={`w-full rounded-[8px] px-3 py-2 text-start text-xs font-medium transition ${
              !filters.categoryId
                ? 'bg-accent text-white font-bold'
                : 'text-body hover:bg-alt hover:text-heading'
            }`}
          >
            كل الأقسام
          </button>
          {categories.map((c) => {
            const isSelected = filters.categoryId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onFilterChange({ categoryId: c.id, page: 1 })}
                className={`w-full rounded-[8px] px-3 py-2 text-start text-xs font-medium transition ${
                  isSelected
                    ? 'bg-accent text-white font-bold'
                    : 'text-body hover:bg-alt hover:text-heading'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-secondary transition hover:bg-alt hover:text-heading"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>إعادة ضبط الفلاتر</span>
        </button>
      )}

      {/* Apply button for mobile */}
      {isMobileModal && (
        <button
          type="button"
          onClick={onCloseMobileModal}
          className="w-full rounded-[10px] bg-accent py-3 text-sm font-bold text-white shadow-xs transition hover:bg-accent-hover"
        >
          تطبيق الفلاتر
        </button>
      )}
    </div>
  )

  if (isMobileModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="فلاتر البحث"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-heading/40 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobileModal}
          aria-hidden="true"
        />
        {/* Bottom sheet container */}
        <div className="relative z-10 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-surface p-6 shadow-2xl border-t border-border">
          {content}
        </div>
      </div>
    )
  }

  // Desktop Side Panel
  return (
    <aside
      aria-label="خيارات تصفية الكتالوج"
      className="hidden rounded-[10px] border border-border bg-surface p-5 lg:block"
    >
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
        <Filter className="h-4 w-4 text-accent" aria-hidden="true" />
        <h2 className="font-heading text-sm font-bold text-heading">تصفية النتائج</h2>
      </div>
      {content}
    </aside>
  )
}
