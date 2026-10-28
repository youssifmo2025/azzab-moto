import type { Category } from '../schemas/category'

export interface CategoryRepository {
  getAll(): Promise<Category[]>
  getById(id: string): Promise<Category | null>
  getBySlug(slug: string): Promise<Category | null>
}
