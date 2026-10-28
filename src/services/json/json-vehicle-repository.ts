import rawModels from '@/data/models.json'
import type { VehicleRepository } from '../interfaces/vehicle-repository.interface'
import { ModelsArraySchema, type Model } from '../schemas/model'

export class JsonVehicleRepository implements VehicleRepository {
  private modelsCache: Model[] | null = null

  /**
   * Lazily loads and validates vehicle models data through Zod schema.
   */
  private getModels(): Model[] {
    if (!this.modelsCache) {
      this.modelsCache = ModelsArraySchema.parse(rawModels)
    }
    return this.modelsCache
  }

  async getAll(): Promise<Model[]> {
    return [...this.getModels()]
  }

  async getById(id: string): Promise<Model | null> {
    const models = this.getModels()
    const model = models.find((m) => m.id === id)
    return model ? { ...model } : null
  }
}
