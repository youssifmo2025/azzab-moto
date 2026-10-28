import { useState, useEffect } from 'react'
import type { Product } from '@/services/schemas/product'
import { productRepository } from '@/services/json'

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!slug) return

    productRepository
      .getBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setProduct(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return { product: slug ? product : null, loading: slug ? loading : false, error }
}
