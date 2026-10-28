import { z } from 'zod'
import { ApiClientError, ApiErrorSchema } from './schemas/error'

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
  responseSchema?: z.ZodTypeAny
  timeoutMs?: number
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`))
  return match ? decodeURIComponent(match[3]) : null
}

export class ApiClient {
  private baseUrl: string
  private csrfToken: string | null = null

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? (import.meta.env.VITE_API_BASE_URL || '')
  }

  public setCsrfToken(token: string): void {
    this.csrfToken = token
  }

  public getCsrfToken(): string | null {
    return this.csrfToken ?? getCookie('csrfToken')
  }

  public async fetchCsrfToken(): Promise<string> {
    try {
      const res = await this.get<{ csrfToken: string }>('/api/auth/csrf-token', {
        responseSchema: z.object({ csrfToken: z.string() }),
      })
      this.csrfToken = res.csrfToken
      return res.csrfToken
    } catch {
      return ''
    }
  }

  public async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      body,
      params,
      responseSchema,
      headers = {},
      timeoutMs = 15000,
      signal: externalSignal,
      method = 'GET',
      ...rest
    } = options

    // Construct URL with query parameters
    let url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
        url = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
      } else {
        url = `http://localhost${url.startsWith('/') ? '' : '/'}${url}`
      }
    }
    if (params) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      }
      const qs = searchParams.toString()
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs
      }
    }

    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
    const reqHeaders = new Headers(headers)

    if (!reqHeaders.has('Accept')) {
      reqHeaders.set('Accept', 'application/json')
    }

    // Attach CSRF token on mutating requests if present
    if (isMutating) {
      const token = this.getCsrfToken()
      if (token && !reqHeaders.has('X-CSRF-Token')) {
        reqHeaders.set('X-CSRF-Token', token)
      }
    }

    let serializedBody: BodyInit | undefined = undefined
    if (body !== undefined) {
      if (body instanceof FormData) {
        serializedBody = body
      } else {
        if (!reqHeaders.has('Content-Type')) {
          reqHeaders.set('Content-Type', 'application/json; charset=utf-8')
        }
        serializedBody = JSON.stringify(body)
      }
    }

    let timer: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new DOMException('The operation was aborted due to timeout', 'AbortError'))
      }, timeoutMs)
    })

    try {
      const fetchInit: RequestInit = {
        method,
        headers: reqHeaders,
        body: serializedBody,
        credentials: 'include',
        ...rest,
      }
      if (externalSignal) {
        fetchInit.signal = externalSignal
      }

      const response = await Promise.race([fetch(url, fetchInit), timeoutPromise])

      clearTimeout(timer)

      // Handle CSV stream downloads
      if (response.headers.get('content-type')?.includes('text/csv')) {
        const blob = await response.blob()
        return blob as unknown as T
      }

      if (!response.ok) {
        let errorData: { code: string; message: string; fieldErrors?: Record<string, string[]> }

        try {
          const json = await response.json()
          const parsed = ApiErrorSchema.safeParse(json)
          if (parsed.success) {
            errorData = parsed.data
          } else {
            errorData = {
              code: `HTTP_${response.status}`,
              message: json.message || response.statusText || 'حدث خطأ غير متوقع',
            }
          }
        } catch {
          errorData = {
            code: `HTTP_${response.status}`,
            message: response.statusText || 'تعذر الاتصال بالخادم',
          }
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          errorData.code = 'RATE_LIMITED'
          errorData.message = retryAfter
            ? `تم تجاوز معدل الطلبات المسموح، يرجى المحاولة بعد ${retryAfter} ثانية`
            : 'تم تجاوز معدل الطلبات المسموح، يرجى الانتظار قليلاً والمحاولة مجدداً'
        }

        throw new ApiClientError(response.status, errorData)
      }

      // If empty response
      if (response.status === 204) {
        return undefined as unknown as T
      }

      const json = await response.json()

      if (responseSchema) {
        const parsed = responseSchema.safeParse(json)
        if (!parsed.success) {
          console.error('[ApiClient] Validation error for response:', parsed.error)
          throw new ApiClientError(500, {
            code: 'CLIENT_VALIDATION_ERROR',
            message: 'استجابة الخادم غير متوافقة مع نموذج البيانات المتوقع',
          })
        }
        return parsed.data as T
      }

      return json as T
    } catch (err: unknown) {
      clearTimeout(timer)
      if (err instanceof ApiClientError) {
        throw err
      }

      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      throw new ApiClientError(0, {
        code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isAbort
          ? 'استغرقت الاستجابة وقتاً أطول من المعتاد، يرجى التحقق من اتصالك بالإنترنت'
          : 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت',
      })
    }
  }

  public get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  public post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  public patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  public put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  public delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
