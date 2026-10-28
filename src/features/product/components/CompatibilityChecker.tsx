import { useState } from 'react'
import { CheckCircle2, AlertTriangle, HelpCircle, ChevronDown } from 'lucide-react'
import type { Compatibility } from '@/services/schemas/product'
import { useModels } from '@/features/vehicle-selector/hooks/useModels'
import { storage } from '@/shared/lib/storage'
import { checkProductCompatibility } from '../utils/compatibility'

interface CompatibilityCheckerProps {
  compatibilityList: Compatibility[]
}

export function CompatibilityChecker({ compatibilityList }: CompatibilityCheckerProps) {
  const { models } = useModels()
  const [selectedModelId, setSelectedModelId] = useState(
    () => storage.vehicleFilter.get().modelId || '',
  )
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    () => storage.vehicleFilter.get().year,
  )

  const selectedModel = models.find((m) => m.id === selectedModelId)
  const availableYears = selectedModel ? [...selectedModel.years].sort((a, b) => b - a) : []

  const result = checkProductCompatibility(
    compatibilityList,
    selectedModelId || undefined,
    selectedYear,
  )

  const isChecked = result.isChecked
  const isCompatible = result.isCompatible

  return (
    <div
      className={`rounded-[12px] border p-5 transition-colors duration-200 ${
        !isChecked
          ? 'border-border bg-alt'
          : isCompatible
            ? 'border-success/40 bg-success/10'
            : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {!isChecked ? (
          <HelpCircle className="h-5 w-5 text-secondary" aria-hidden="true" />
        ) : isCompatible ? (
          <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-secondary" aria-hidden="true" />
        )}
        <h3 className="font-heading text-base font-bold text-heading">
          هل القطعة مناسبة لموتوسيكلك؟
        </h3>
      </div>

      <p className="text-xs text-body mb-4 leading-relaxed">
        اختار موديل دراجتك النارية وسنة الصنع للتحقق الفوري من المطابقة الهندسية للقطعة:
      </p>

      {/* Selector Dropdowns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative">
          <label htmlFor="compat-model-select" className="sr-only">
            اختار الموديل
          </label>
          <select
            id="compat-model-select"
            value={selectedModelId}
            onChange={(e) => {
              setSelectedModelId(e.target.value)
              setSelectedYear(undefined)
            }}
            className="w-full appearance-none rounded-[8px] border border-border bg-surface py-2 ps-3 pe-8 text-xs text-heading transition focus:border-accent focus:outline-none"
          >
            <option value="">اختار موديل الموتوسيكل</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary"
            aria-hidden="true"
          />
        </div>

        <div className="relative">
          <label htmlFor="compat-year-select" className="sr-only">
            اختار سنة الصنع
          </label>
          <select
            id="compat-year-select"
            value={selectedYear ?? ''}
            onChange={(e) => {
              setSelectedYear(e.target.value ? Number(e.target.value) : undefined)
            }}
            disabled={!selectedModelId}
            className="w-full appearance-none rounded-[8px] border border-border bg-surface py-2 ps-3 pe-8 text-xs text-heading transition focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">سنة الصنع (اختياري)</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Feedback banner */}
      {isChecked && (
        <div className="mt-4 pt-3 border-t border-border/40 text-xs">
          {isCompatible ? (
            <div className="flex items-start gap-2 text-success font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                نعم، هذه القطعة متوافقة تماماً مع <strong>{selectedModel?.name}</strong>
                {result.matchedRange && (
                  <span className="font-numeric tabular ms-1">
                    (الموديلات من {result.matchedRange.yearFrom} حتى {result.matchedRange.yearTo})
                  </span>
                )}
                .
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-body">
              <AlertTriangle
                className="h-4 w-4 shrink-0 mt-0.5 text-secondary"
                aria-hidden="true"
              />
              <span>
                هذه القطعة غير مسجلة كمتوافقة مع <strong>{selectedModel?.name}</strong>. يرجى مراجعة
                جدول التوافق أدناه أو التواصل معنا للتأكد.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
