import { JsonProductRepository } from './json-product-repository'
import { JsonCategoryRepository } from './json-category-repository'
import { JsonVehicleRepository } from './json-vehicle-repository'

export { JsonProductRepository, JsonCategoryRepository, JsonVehicleRepository }

// Singletons for application-wide repository usage
export const productRepository = new JsonProductRepository()
export const categoryRepository = new JsonCategoryRepository()
export const vehicleRepository = new JsonVehicleRepository()
