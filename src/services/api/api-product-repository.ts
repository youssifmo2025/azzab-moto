import type {
  ProductRepository,
  ProductFilterOptions,
} from '../interfaces/product-repository.interface'
import type { Product } from '../schemas/product'
import { apiClient, ApiClient } from './client'

interface ApiProductPayload {
  id: string
  slug: string
  name: string
  nameEn: string
  sku: string
  partNumber?: string
  categoryId: string
  price: string
  currency: 'EGP'
  availability: 'in_stock' | 'out_of_stock' | 'order_only'
  stockQuantity?: number | null
  images: string[]
  description: string
  compatibility: Array<{
    modelId: string
    yearFrom: number
    yearTo: number
  }>
}

interface PaginatedProductsResponse {
  data: ApiProductPayload[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export class ApiProductRepository implements ProductRepository {
  private client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  private mapToDomain(payload: ApiProductPayload): Product {
    return {
      id: payload.id,
      slug: payload.slug,
      name: payload.name,
      nameEn: payload.nameEn,
      sku: payload.sku,
      partNumber: payload.partNumber ?? '',
      categoryId: payload.categoryId,
      price: parseFloat(payload.price),
      currency: payload.currency ?? 'EGP',
      availability: payload.availability,
      stockQuantity: payload.stockQuantity ?? null,
      images: payload.images,
      description: payload.description,
      compatibility: payload.compatibility ?? [],
    }
  }

  async getAll(): Promise<Product[]> {
    const res = await this.client.get<PaginatedProductsResponse>('/api/products', {
      params: { perPage: 100 },
    })
    return res.data.map((p) => this.mapToDomain(p))
  }

  async getById(id: string): Promise<Product | null> {
    const all = await this.getAll()
    const found = all.find((p) => p.id === id)
    return found ? { ...found } : null
  }

  async getBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await this.client.get<ApiProductPayload>(`/api/products/${encodeURIComponent(slug)}`)
      return this.mapToDomain(res)
    } catch {
      return null
    }
  }

  async getByCategory(categoryId: string): Promise<Product[]> {
    const res = await this.client.get<PaginatedProductsResponse>('/api/products', {
      params: { categoryId, perPage: 100 },
    })
    return res.data.map((p) => this.mapToDomain(p))
  }

  async getByModel(modelId: string, year?: number): Promise<Product[]> {
    const res = await this.client.get<PaginatedProductsResponse>('/api/products', {
      params: { modelId, year, perPage: 100 },
    })
    return res.data.map((p) => this.mapToDomain(p))
  }

  async filter(options: ProductFilterOptions): Promise<Product[]> {
    const res = await this.client.get<PaginatedProductsResponse>('/api/products', {
      params: {
        categoryId: options.categoryId,
        modelId: options.modelId,
        year: options.year,
        q: options.search,
        availability: options.availability,
        perPage: 100,
      },
    })
    return res.data.map((p) => this.mapToDomain(p))
  }

  async search(query: string): Promise<Product[]> {
    if (!query.trim()) return []
    const res = await this.client.get<PaginatedProductsResponse>('/api/products', {
      params: { q: query.trim(), perPage: 50 },
    })
    return res.data.map((p) => this.mapToDomain(p))
  }

  async getBestSellers(limit: number = 8): Promise<Product[]> {
    const res = await this.client.get<PaginatedProductsResponse>('/api/products', {
      params: { sort: 'latest', perPage: limit },
    })
    return res.data.map((p) => this.mapToDomain(p))
  }
}
