import { useState, useEffect } from 'react'
import type { Model } from '@/services/schemas/model'
import { vehicleRepository } from '@/services/json'

export function useModels() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    vehicleRepository
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setModels(data)
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

  return { models, loading, error }
}
