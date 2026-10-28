import {
  productRepository as jsonProductRepo,
  categoryRepository as jsonCategoryRepo,
  vehicleRepository as jsonVehicleRepo,
  orderRepository as jsonOrderRepo,
} from './json'
import { ApiProductRepository } from './api/api-product-repository'
import { ApiCategoryRepository } from './api/api-category-repository'
import { ApiVehicleRepository } from './api/api-vehicle-repository'
import { ApiOrderRepository } from './api/api-order-repository'

export * from './schemas'
export * from './interfaces'
export * from './json'
export * from './api'

const isApiSource = import.meta.env?.VITE_DATA_SOURCE === 'api'

export const activeProductRepository = isApiSource ? new ApiProductRepository() : jsonProductRepo
export const activeCategoryRepository = isApiSource ? new ApiCategoryRepository() : jsonCategoryRepo
export const activeVehicleRepository = isApiSource ? new ApiVehicleRepository() : jsonVehicleRepo
export const activeOrderRepository = isApiSource ? new ApiOrderRepository() : jsonOrderRepo
