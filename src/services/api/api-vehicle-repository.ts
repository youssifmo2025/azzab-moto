import type { VehicleRepository } from '../interfaces/vehicle-repository.interface'
import type { Model } from '../schemas/model'
import { apiClient, ApiClient } from './client'

export class ApiVehicleRepository implements VehicleRepository {
  private client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  async getAll(): Promise<Model[]> {
    return this.client.get<Model[]>('/api/models')
  }

  async getById(id: string): Promise<Model | null> {
    const models = await this.getAll()
    const found = models.find((m) => m.id === id)
    return found ? { ...found } : null
  }
}

