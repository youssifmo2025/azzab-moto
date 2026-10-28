import rawProducts from '@/data/products.json'
import type {
  ProductRepository,
  ProductFilterOptions,
} from '../interfaces/product-repository.interface'
import { ProductsArraySchema, type Product } from '../schemas/product'
import { sanitizeSearch } from '@/shared/utils/sanitizeSearch'
import { matchesArabicSearch } from '@/shared/utils/arabic'

export class JsonProductRepository implements ProductRepository {
  private productsCache: Product[] | null = null

  /**
   * Lazily loads and validates products data through Zod schema.
   * Throws ZodError if JSON format or data types violate the contract.
   */
  private getProducts(): Product[] {
    if (!this.productsCache) {
      this.productsCache = ProductsArraySchema.parse(rawProducts)
    }
    return this.productsCache
  }

  async getAll(): Promise<Product[]> {
    return [...this.getProducts()]
  }

  async getById(id: string): Promise<Product | null> {
    const products = this.getProducts()
    const product = products.find((p) => p.id === id)
    return product ? { ...product } : null
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const products = this.getProducts()
    const product = products.find((p) => p.slug === slug)
    return product ? { ...product } : null
  }

  async getByCategory(categoryId: string): Promise<Product[]> {
    const products = this.getProducts()
    return products.filter((p) => p.categoryId === categoryId)
  }

  async getByModel(modelId: string, year?: number): Promise<Product[]> {
    const products = this.getProducts()
    return products.filter((p) =>
      p.compatibility.some((c) => {
        if (c.modelId !== modelId) return false
        if (year !== undefined) {
          return year >= c.yearFrom && year <= c.yearTo
        }
        return true
      }),
    )
  }

  async filter(options: ProductFilterOptions): Promise<Product[]> {
    let result = this.getProducts()

    if (options.categoryId) {
      result = result.filter((p) => p.categoryId === options.categoryId)
    }

    if (options.modelId) {
      result = result.filter((p) =>
        p.compatibility.some((c) => {
          if (c.modelId !== options.modelId) return false
          if (options.year !== undefined) {
            return options.year >= c.yearFrom && options.year <= c.yearTo
          }
          return true
        }),
      )
    }

    if (options.availability) {
      result = result.filter((p) => p.availability === options.availability)
    }

    if (options.search) {
      const sanitized = sanitizeSearch(options.search)
      if (sanitized) {
        result = result.filter(
          (p) =>
            matchesArabicSearch(p.name, sanitized) ||
            matchesArabicSearch(p.nameEn, sanitized) ||
            matchesArabicSearch(p.sku, sanitized) ||
            matchesArabicSearch(p.partNumber, sanitized),
        )
      }
    }

    return result
  }

  async search(query: string): Promise<Product[]> {
    const sanitized = sanitizeSearch(query)
    if (!sanitized) {
      return []
    }

    const products = this.getProducts()
    return products.filter(
      (p) =>
        matchesArabicSearch(p.name, sanitized) ||
        matchesArabicSearch(p.nameEn, sanitized) ||
        matchesArabicSearch(p.sku, sanitized) ||
        matchesArabicSearch(p.partNumber, sanitized),
    )
  }

  async getBestSellers(limit: number = 8): Promise<Product[]> {
    const products = this.getProducts()
    // For Starter mock, in_stock items come first
    const available = products.filter((p) => p.availability === 'in_stock')
    return available.slice(0, limit)
  }
}
