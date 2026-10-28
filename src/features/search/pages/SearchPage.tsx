import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, ArrowUpDown, ChevronLeft, SlidersHorizontal } from 'lucide-react'
import { siteConfig } from '@/app/config/site'
import { useProducts } from '@/features/catalog/hooks/useProducts'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { CatalogSkeleton } from '@/features/catalog/components/CatalogSkeleton'
import { EmptyCatalogState } from '@/features/catalog/components/EmptyCatalogState'
import { sanitizeSearch } from '@/shared/utils/sanitizeSearch'
import { matchesArabicSearch } from '@/shared/utils/arabic'
import type { CatalogSort } from '@/features/catalog/schemas/catalog-params.schema'

const ITEMS_PER_PAGE = 8

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const rawQuery = searchParams.get('q') ?? ''
  const query = sanitizeSearch(rawQuery)

  const [sort, setSort] = useState<CatalogSort>('name_asc')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const { products, loading } = useProducts()

  const searchResults = useMemo(() => {
    if (!query) return []

    const list = products.filter((p) => {
      return (
        matchesArabicSearch(p.name, query) ||
        matchesArabicSearch(p.nameEn, query) ||
        matchesArabicSearch(p.sku, query) ||
        matchesArabicSearch(p.partNumber, query)
      )
    })

    switch (sort) {
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
  }, [products, query, sort])

  const visibleProducts = searchResults.slice(0, visibleCount)
  const hasMore = visibleCount < searchResults.length

  const pageTitle = query
    ? `نتائج البحث عن "${query}" — ${siteConfig.name}`
    : `البحث في الكتالوج — ${siteConfig.name}`

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`نتائج البحث عن قطع غيار TVS في متجر عزاب موتو`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 sm:py-10">
        {/* Breadcrumb */}
        <nav
          aria-label="مسار التنقل"
          className="mb-4 flex items-center gap-1.5 text-xs text-secondary"
        >
          <Link to="/" className="hover:text-heading">
            الرئيسية
          </Link>
          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
          <Link to="/catalog" className="hover:text-heading">
            الكتالوج
          </Link>
          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
          <span className="text-heading font-medium" aria-current="page">
            نتائج البحث
          </span>
        </nav>

        {/* Search Results Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-accent" aria-hidden="true" />
              <h1 className="font-heading text-2xl font-extrabold text-heading sm:text-3xl">
                {query ? `نتائج البحث عن: "${query}"` : 'البحث في الكتالوج'}
              </h1>
            </div>
            {query && (
              <p className="mt-1 text-xs text-body sm:text-sm">
                تم العثور على {searchResults.length} قطعة غيار مطابقة
              </p>
            )}
          </div>

          {/* Sort Dropdown */}
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="search-sort"
                className="flex items-center gap-1 text-xs font-medium text-body"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
                <span>الترتيب:</span>
              </label>
              <select
                id="search-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as CatalogSort)}
                className="rounded-[8px] border border-border bg-base px-2.5 py-1.5 text-xs text-heading transition focus:border-accent focus:outline-none"
              >
                <option value="name_asc">الاسم (أ - ي)</option>
                <option value="name_desc">الاسم (ي - أ)</option>
                <option value="price_asc">السعر (الأقل أولاً)</option>
                <option value="price_desc">السعر (الأعلى أولاً)</option>
              </select>
            </div>
          )}
        </div>

        {/* Product Grid / Empty State */}
        {loading ? (
          <CatalogSkeleton count={8} />
        ) : !query || searchResults.length === 0 ? (
          <EmptyCatalogState query={query} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface px-8 py-3 text-sm font-semibold text-heading shadow-xs transition hover:bg-alt hover:border-accent"
                >
                  <SlidersHorizontal className="h-4 w-4 text-secondary" aria-hidden="true" />
                  <span>عرض المزيد ({searchResults.length - visibleCount} متبقية)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
