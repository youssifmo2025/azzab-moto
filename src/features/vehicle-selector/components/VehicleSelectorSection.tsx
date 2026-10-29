import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import { useModels } from '@/features/vehicle-selector/hooks/useModels'
import { useCategories } from '@/features/catalog/hooks/useCategories'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

export function VehicleSelectorSection() {
  const { models } = useModels()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const ref = useScrollReveal<HTMLElement>()

  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Derive years from the selected model
  const selectedModelData = models.find((m) => m.id === selectedModel)
  const availableYears: number[] = selectedModelData
    ? [...selectedModelData.years].sort((a, b) => b - a)
    : []

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedModel) params.set('modelId', selectedModel)
    if (selectedYear) params.set('year', selectedYear)
    if (selectedCategory) params.set('categoryId', selectedCategory)
    navigate(`/catalog?${params.toString()}`)
  }

  const canSearch = selectedModel || selectedCategory

  return (
    <section
      id="vehicle-selector"
      ref={ref}
      aria-labelledby="vehicle-selector-heading"
      className="relative overflow-hidden bg-alt pt-6 sm:pt-8 pb-12 sm:pb-14 border-b border-border/80"
    >
      <div className="container relative mx-auto px-4 z-10">
        <div className="mx-auto max-w-3xl rounded-[18px] border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-promo border border-accent/30 px-3 py-0.5 text-xs font-semibold text-accent-text mb-2 shadow-2xs">
                تحديد دقيق للموديل
              </span>
              <h2
                id="vehicle-selector-heading"
                className="font-heading text-xl font-extrabold text-heading sm:text-2xl"
              >
                اختار موتوسيكلك
              </h2>
              <p className="mt-1 text-sm text-body">
                ابحث عن القطع الأصلية المتوافقة تماماً مع دراجتك وسنة الصنع
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Model */}
            <div className="relative">
              <label htmlFor="vs-model" className="mb-1.5 block text-xs font-semibold text-heading">
                الموديل
              </label>
              <div className="relative">
                <select
                  id="vs-model"
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value)
                    setSelectedYear('')
                  }}
                  className="w-full appearance-none rounded-[10px] border border-border bg-white py-2.5 ps-4 pe-9 text-sm text-heading transition hover:border-border/90 focus:border-accent focus:ring-2 focus:ring-accent/18 focus:outline-none"
                >
                  <option value="" className="bg-white text-heading">اختار الموديل</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-white text-heading">
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Year */}
            <div className="relative">
              <label htmlFor="vs-year" className="mb-1.5 block text-xs font-semibold text-heading">
                سنة الصنع
              </label>
              <div className="relative">
                <select
                  id="vs-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={!selectedModel}
                  className="w-full appearance-none rounded-[10px] border border-border bg-white py-2.5 ps-4 pe-9 text-sm text-heading transition hover:border-border/90 focus:border-accent focus:ring-2 focus:ring-accent/18 focus:outline-none disabled:cursor-not-allowed disabled:bg-alt/50 disabled:opacity-50"
                >
                  <option value="" className="bg-white text-heading">اختار السنة</option>
                  {availableYears.map((y) => (
                    <option key={y} value={String(y)} className="bg-white text-heading">
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Category */}
            <div className="relative">
              <label
                htmlFor="vs-category"
                className="mb-1.5 block text-xs font-semibold text-heading"
              >
                نوع القطعة
              </label>
              <div className="relative">
                <select
                  id="vs-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none rounded-[10px] border border-border bg-white py-2.5 ps-4 pe-9 text-sm text-heading transition hover:border-border/90 focus:border-accent focus:ring-2 focus:ring-accent/18 focus:outline-none"
                >
                  <option value="" className="bg-white text-heading">كل الأقسام</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white text-heading">
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSearch}
            className="btn-primary mt-6 w-full sm:w-auto px-8 py-3.5 text-sm font-bold shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 disabled:pointer-events-none"
          >
            <Search className="h-4 w-4 me-2 btn-icon-nudge" aria-hidden="true" />
            <span>ابحث عن القطع المتوافقة</span>
          </button>
        </div>
      </div>
    </section>
  )
}
