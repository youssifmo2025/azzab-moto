import { http, HttpResponse, delay } from 'msw'
import { initialMockProducts, mockCategories, mockModels } from '../data/mock-data'
import { matchesArabicSearch } from '@/shared/utils/arabic'
import { sanitizeSearch } from '@/shared/utils/sanitizeSearch'

const products = [...initialMockProducts]

export const productHandlers = [
  http.get('/api/products', async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)

    // Error simulation hook
    if (url.searchParams.get('simulate_error') === '500') {
      return HttpResponse.json(
        { code: 'INTERNAL_ERROR', message: 'خطأ داخلي في الخادم المحاكى' },
        { status: 500 },
      )
    }

    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const perPage = parseInt(url.searchParams.get('perPage') || '20', 10)
    const categoryId = url.searchParams.get('categoryId')
    const modelId = url.searchParams.get('modelId')
    const yearStr = url.searchParams.get('year')
    const year = yearStr ? parseInt(yearStr, 10) : undefined
    const q = url.searchParams.get('q')
    const availability = url.searchParams.get('availability')
    const sort = url.searchParams.get('sort')

    let filtered = [...products]

    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId)
    }

    if (modelId) {
      filtered = filtered.filter((p) =>
        p.compatibility.some((c) => {
          if (c.modelId !== modelId) return false
          if (year !== undefined) {
            return year >= c.yearFrom && year <= c.yearTo
          }
          return true
        }),
      )
    }

    if (availability) {
      filtered = filtered.filter((p) => p.availability === availability)
    }

    if (q) {
      const sanitized = sanitizeSearch(q)
      if (sanitized) {
        filtered = filtered.filter(
          (p) =>
            matchesArabicSearch(p.name, sanitized) ||
            matchesArabicSearch(p.nameEn, sanitized) ||
            matchesArabicSearch(p.sku, sanitized) ||
            matchesArabicSearch(p.partNumber, sanitized),
        )
      }
    }

    if (sort === 'price_asc') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    } else if (sort === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / perPage) || 1
    const offset = (page - 1) * perPage
    const pagedItems = filtered.slice(offset, offset + perPage)

    return HttpResponse.json({
      data: pagedItems,
      meta: {
        page,
        perPage,
        total,
        totalPages,
      },
    })
  }),

  http.get('/api/products/:slug', async ({ params }) => {
    await delay(100)
    const { slug } = params
    const product = products.find((p) => p.slug === slug)

    if (!product) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'المنتج المطلوب غير موجود' },
        { status: 404 },
      )
    }

    return HttpResponse.json(product)
  }),

  http.get('/api/categories', async () => {
    await delay(80)
    return HttpResponse.json(mockCategories)
  }),

  http.get('/api/models', async () => {
    await delay(80)
    return HttpResponse.json(mockModels)
  }),
]

