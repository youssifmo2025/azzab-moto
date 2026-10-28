import type { Model } from '../schemas/model'

export interface VehicleRepository {
  getAll(): Promise<Model[]>
  getById(id: string): Promise<Model | null>
}
