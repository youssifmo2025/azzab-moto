import type { Product } from '../schemas/product'

export interface ProductFilterOptions {
  categoryId?: string
  modelId?: string
  year?: number
  search?: string
  availability?: string
}

export interface ProductRepository {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product | null>
  getBySlug(slug: string): Promise<Product | null>
  getByCategory(categoryId: string): Promise<Product[]>
  getByModel(modelId: string, year?: number): Promise<Product[]>
  filter(options: ProductFilterOptions): Promise<Product[]>
  search(query: string): Promise<Product[]>
  getBestSellers(limit?: number): Promise<Product[]>
}
