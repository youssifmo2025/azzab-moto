import { productHandlers } from './products'
import { orderHandlers } from './orders'
import { authHandlers } from './auth'
import { adminHandlers } from './admin'

export const handlers = [
  ...productHandlers,
  ...orderHandlers,
  ...authHandlers,
  ...adminHandlers,
]
