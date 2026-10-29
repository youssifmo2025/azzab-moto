import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { siteConfig } from '@/app/config/site'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { ProductCard } from '../components/ProductCard'
import { CatalogFilters } from '../components/CatalogFilters'
import { EmptyCatalogState } from '../components/EmptyCatalogState'
import { CatalogSkeleton } from '../components/CatalogSkeleton'
import {
  parseCatalogQueryParams,
  type CatalogQueryParams,
  type CatalogSort,
} from '../schemas/catalog-params.schema'
import { matchesArabicSearch } from '@/shared/utils/arabic'

const ITEMS_PER_PAGE = 8

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const { products, loading, error } = useProducts()
  const { categories } = useCategories()

  // Safely parse query parameters with Zod
  const filters: CatalogQueryParams = useMemo(() => {
    return parseCatalogQueryParams(searchParams)
  }, [searchParams])

  // Update URL search parameters safely
  const updateFilters = (newFilters: Partial<CatalogQueryParams>) => {
    const next = { ...filters, ...newFilters }
    const params = new URLSearchParams()

    if (next.modelId) params.set('modelId', next.modelId)
    if (next.year) params.set('year', String(next.year))
    if (next.categoryId) params.set('categoryId', next.categoryId)
    if (next.q) params.set('q', next.q)
    if (next.sort && next.sort !== 'name_asc') params.set('sort', next.sort)

    setSearchParams(params)
    setVisibleCount(ITEMS_PER_PAGE) // reset visible count on filter change
  }

  const resetFilters = () => {
    setSearchParams(new URLSearchParams())
    setVisibleCount(ITEMS_PER_PAGE)
  }

  // Filter & Sort products in memory
  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (filters.categoryId) {
      list = list.filter((p) => p.categoryId === filters.categoryId)
    }

    if (filters.modelId) {
      list = list.filter((p) =>
        p.compatibility.some((c) => {
          if (c.modelId !== filters.modelId) return false
          if (filters.year !== undefined) {
            return filters.year >= c.yearFrom && filters.year <= c.yearTo
          }
          return true
        }),
      )
    }

    if (filters.q) {
      list = list.filter(
        (p) =>
          matchesArabicSearch(p.name, filters.q!) ||
          matchesArabicSearch(p.nameEn, filters.q!) ||
          matchesArabicSearch(p.sku, filters.q!) ||
          matchesArabicSearch(p.partNumber, filters.q!),
      )
    }

    // Sorting: strictly name / price
    switch (filters.sort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'name_desc':
        list.sort((a, b) => b.name.localeCompare(a.name, 'ar'))
        break
      case 'name_asc':
      default:
        list.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        break
    }

    return list
  }, [products, filters])

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProducts.length

  const activeCategory = categories.find((c) => c.id === filters.categoryId)
  const pageTitle = activeCategory
    ? `قطع غيار ${activeCategory.name} — ${siteConfig.name}`
    : `كتالوج قطع الغيار — ${siteConfig.name}`

  const activeFilterCount = [filters.categoryId, filters.modelId, filters.year, filters.q].filter(
    Boolean,
  ).length

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="كتالوج قطع غيار دراجات TVS النارية في مصر. فرامل، فلاتر، محرك، وزيوت أصلية."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 sm:py-10">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-extrabold text-heading sm:text-3xl">
            {activeCategory ? activeCategory.name : 'كتالوج قطع الغيار'}
          </h1>
          <p className="mt-1 text-xs text-body sm:text-sm">
            عرض {filteredProducts.length} قطعة غيار متوافقة
          </p>
        </div>

        {/* Toolbar: Mobile Filter Trigger & Sort Control */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-surface p-3">
          {/* Mobile Filter Sheet Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="btn-press flex items-center gap-2 rounded-[8px] border border-border bg-base px-3.5 py-2 text-xs font-semibold text-heading hover:bg-alt lg:hidden"
          >
            <Filter className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>تصفية النتائج</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown (strictly name / price) */}
          <div className="flex items-center gap-2 ms-auto">
            <label
              htmlFor="catalog-sort"
              className="flex items-center gap-1 text-xs font-medium text-body"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
              <span>الترتيب:</span>
            </label>
            <select
              id="catalog-sort"
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as CatalogSort })}
              className="rounded-[8px] border border-border bg-base px-2.5 py-1.5 text-xs text-heading transition focus:border-accent focus:outline-none"
            >
              <option value="name_asc">الاسم (أ - ي)</option>
              <option value="name_desc">الاسم (ي - أ)</option>
              <option value="price_asc">السعر (الأقل أولاً)</option>
              <option value="price_desc">السعر (الأعلى أولاً)</option>
            </select>
          </div>
        </div>

        {/* Main Layout Grid: Desktop Sidebar Filters + Product Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Desktop Filter Sidebar */}
          <div className="lg:col-span-1">
            <CatalogFilters
              filters={filters}
              onFilterChange={updateFilters}
              onReset={resetFilters}
            />
          </div>

          {/* Product Listing Section */}
          <div className="lg:col-span-3">
            {error && (
              <div className="rounded-[10px] border border-error/30 bg-error/10 p-4 text-xs text-error">
                حدث خطأ أثناء تحميل المنتجات. يرجى إعادة المحاولة.
              </div>
            )}

            {loading ? (
              <CatalogSkeleton count={8} />
            ) : filteredProducts.length === 0 ? (
              <EmptyCatalogState
                query={filters.q}
                onResetFilters={activeFilterCount > 0 ? resetFilters : undefined}
              />
            ) : (
              <>
                {/* 2 columns on mobile per design brief */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 gap-y-6">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* "Load More" pagination (strictly no infinite scroll) */}
                {hasMore && (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                      className="btn-press inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface px-8 py-3 text-sm font-semibold text-heading shadow-xs transition hover:bg-alt hover:border-accent"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-secondary" aria-hidden="true" />
                      <span>
                        عرض المزيد من القطع ({filteredProducts.length - visibleCount} متبقية)
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom-sheet Filters */}
      {isMobileFilterOpen && (
        <CatalogFilters
          filters={filters}
          onFilterChange={updateFilters}
          onReset={resetFilters}
          isMobileModal
          onCloseMobileModal={() => setIsMobileFilterOpen(false)}
        />
      )}
    </>
  )
}
