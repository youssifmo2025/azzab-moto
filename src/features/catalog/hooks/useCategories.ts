import { useState, useEffect } from 'react'
import type { Category } from '@/services/schemas/category'
import { categoryRepository } from '@/services/json'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    categoryRepository
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setCategories(data)
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
  }, [])

  return { categories, loading, error }
}
