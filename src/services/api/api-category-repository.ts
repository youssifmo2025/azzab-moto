import type { CategoryRepository } from '../interfaces/category-repository.interface'
import type { Category } from '../schemas/category'
import { apiClient, ApiClient } from './client'

export class ApiCategoryRepository implements CategoryRepository {
  private client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  async getAll(): Promise<Category[]> {
    return this.client.get<Category[]>('/api/categories')
  }

  async getById(id: string): Promise<Category | null> {
    const categories = await this.getAll()
    const found = categories.find((c) => c.id === id)
    return found ? { ...found } : null
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getAll()
    const found = categories.find((c) => c.slug === slug)
    return found ? { ...found } : null
  }
}

