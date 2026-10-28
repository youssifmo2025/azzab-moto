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
      className="border-t border-border bg-alt py-12"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-[16px] border border-border bg-surface p-6 shadow-card-hover sm:p-8">
          <h2
            id="vehicle-selector-heading"
            className="font-heading text-xl font-extrabold text-heading sm:text-2xl"
          >
            اختار موتوسيكلك
          </h2>
          <p className="mt-1 text-sm text-body">ابحث عن القطع المتوافقة مع موديلك مباشرة</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  className="w-full appearance-none rounded-[10px] border border-border bg-base py-2.5 ps-4 pe-9 text-sm text-heading transition focus:border-accent focus:outline-none"
                >
                  <option value="">اختار الموديل</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
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
                  className="w-full appearance-none rounded-[10px] border border-border bg-base py-2.5 ps-4 pe-9 text-sm text-heading transition focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">اختار السنة</option>
                  {availableYears.map((y) => (
                    <option key={y} value={String(y)}>
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
                  className="w-full appearance-none rounded-[10px] border border-border bg-base py-2.5 ps-4 pe-9 text-sm text-heading transition focus:border-accent focus:outline-none"
                >
                  <option value="">كل الأقسام</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
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
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>ابحث عن القطع المتوافقة</span>
          </button>
        </div>
      </div>
    </section>
  )
}
