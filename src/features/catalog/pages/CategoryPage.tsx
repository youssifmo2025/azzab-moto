import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronLeft, ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import { siteConfig } from '@/app/config/site'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { CatalogSkeleton } from '../components/CatalogSkeleton'
import { EmptyCatalogState } from '../components/EmptyCatalogState'
import type { CatalogSort } from '../schemas/catalog-params.schema'

const ITEMS_PER_PAGE = 8

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { categories, loading: catLoading } = useCategories()
  const { products, loading: prodLoading } = useProducts()

  const [sort, setSort] = useState<CatalogSort>('name_asc')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.slug === slug)
  }, [categories, slug])

  const categoryProducts = useMemo(() => {
    if (!currentCategory) return []
    const list = products.filter((p) => p.categoryId === currentCategory.id)

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
  }, [products, currentCategory, sort])

  const visibleProducts = categoryProducts.slice(0, visibleCount)
  const hasMore = visibleCount < categoryProducts.length

  const title = currentCategory
    ? `قطع غيار ${currentCategory.name} — ${siteConfig.name}`
    : `قسم قطع الغيار — ${siteConfig.name}`

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content={currentCategory?.description || `قطع غيار أصلية متوافقة مع دراجات TVS في مصر`}
        />
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
            {currentCategory?.name || slug}
          </span>
        </nav>

        {/* Category Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-heading sm:text-3xl">
              {currentCategory ? `قطع غيار ${currentCategory.name}` : slug}
            </h1>
            {currentCategory?.description && (
              <p className="mt-1 text-sm text-body">{currentCategory.description}</p>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="cat-sort"
              className="flex items-center gap-1 text-xs font-medium text-body"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
              <span>الترتيب:</span>
            </label>
            <select
              id="cat-sort"
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
        </div>

        {/* Content */}
        {catLoading || prodLoading ? (
          <CatalogSkeleton count={8} />
        ) : categoryProducts.length === 0 ? (
          <EmptyCatalogState />
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
                  <span>عرض المزيد ({categoryProducts.length - visibleCount} متبقية)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
