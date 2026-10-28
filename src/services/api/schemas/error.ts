import { z } from 'zod'

export const ApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

export class ApiClientError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly fieldErrors?: Record<string, string[]>

  constructor(status: number, error: { code: string; message: string; fieldErrors?: Record<string, string[]> }) {
    super(error.message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = error.code
    this.fieldErrors = error.fieldErrors
  }
}
