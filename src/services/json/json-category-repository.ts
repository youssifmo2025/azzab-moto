import rawCategories from '@/data/categories.json'
import type { CategoryRepository } from '../interfaces/category-repository.interface'
import { CategoriesArraySchema, type Category } from '../schemas/category'

export class JsonCategoryRepository implements CategoryRepository {
  private categoriesCache: Category[] | null = null

  /**
   * Lazily loads and validates categories data through Zod schema.
   */
  private getCategories(): Category[] {
    if (!this.categoriesCache) {
      this.categoriesCache = CategoriesArraySchema.parse(rawCategories)
    }
    return this.categoriesCache
  }

  async getAll(): Promise<Category[]> {
    return [...this.getCategories()]
  }

  async getById(id: string): Promise<Category | null> {
    const categories = this.getCategories()
    const category = categories.find((c) => c.id === id)
    return category ? { ...category } : null
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const categories = this.getCategories()
    const category = categories.find((c) => c.slug === slug)
    return category ? { ...category } : null
  }
}
