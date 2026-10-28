import { describe, it, expect, beforeEach, vi } from 'vitest'
import { z } from 'zod'
import {
  storage,
  readStorage,
  writeStorage,
  removeStorage,
  STORAGE_KEYS,
  STORAGE_PREFIX,
} from '@/shared/lib/storage'

describe('Storage Helper', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Low-level readStorage, writeStorage, removeStorage', () => {
    it('returns fallback when key is missing', () => {
      const result = readStorage('am_non_existent_key', z.string(), 'fallback-value')
      expect(result).toBe('fallback-value')
    })

    it('returns fallback when JSON in localStorage is corrupted (invalid syntax)', () => {
      localStorage.setItem('am_corrupted_key', '{not: valid json[}')
      const result = readStorage('am_corrupted_key', z.object({ foo: z.string() }), { foo: 'safe' })
      expect(result).toEqual({ foo: 'safe' })
    })

    it('returns fallback when stored data fails Zod schema validation (wrong type/version)', () => {
      // Stored string when number is expected
      localStorage.setItem('am_wrong_version', JSON.stringify('not-a-number'))
      const result = readStorage('am_wrong_version', z.number(), 42)
      expect(result).toBe(42)

      // Stored object with missing required fields
      localStorage.setItem('am_invalid_shape', JSON.stringify({ wrongField: 123 }))
      const schema = z.object({ requiredName: z.string() })
      const shapeResult = readStorage('am_invalid_shape', schema, { requiredName: 'default' })
      expect(shapeResult).toEqual({ requiredName: 'default' })
    })

    it('reads valid JSON matching schema successfully', () => {
      writeStorage('am_test_key', { count: 5 })
      const result = readStorage('am_test_key', z.object({ count: z.number() }), { count: 0 })
      expect(result).toEqual({ count: 5 })
    })

    it('removes keys cleanly', () => {
      writeStorage('am_to_remove', 'hello')
      expect(localStorage.getItem('am_to_remove')).not.toBeNull()
      removeStorage('am_to_remove')
      expect(localStorage.getItem('am_to_remove')).toBeNull()
    })

    it('handles localStorage exceptions gracefully (e.g. quota or security error)', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const success = writeStorage('am_test_error', 'data')
      expect(success).toBe(false)

      spy.mockRestore()
    })
  })

  describe('Typed Application Storage Entries', () => {
    it('uses am_ namespace and version suffixes for all storage keys', () => {
      expect(STORAGE_KEYS.PAGE_VISITS).toMatch(new RegExp(`^${STORAGE_PREFIX}.*_v1$`))
      expect(STORAGE_KEYS.PWA_DISMISSED).toMatch(new RegExp(`^${STORAGE_PREFIX}.*_v1$`))
      expect(STORAGE_KEYS.LAST_SEARCH).toMatch(new RegExp(`^${STORAGE_PREFIX}.*_v1$`))
      expect(STORAGE_KEYS.VEHICLE_FILTER).toMatch(new RegExp(`^${STORAGE_PREFIX}.*_v1$`))
    })

    it('manages pageVisits count and increments properly', () => {
      expect(storage.pageVisits.get()).toBe(0)

      storage.pageVisits.set(2)
      expect(storage.pageVisits.get()).toBe(2)

      const inc = storage.pageVisits.increment()
      expect(inc).toBe(3)
      expect(storage.pageVisits.get()).toBe(3)

      storage.pageVisits.clear()
      expect(storage.pageVisits.get()).toBe(0)
    })

    it('manages pwaDismissed flag', () => {
      expect(storage.pwaDismissed.get()).toBe(false)

      storage.pwaDismissed.set(true)
      expect(storage.pwaDismissed.get()).toBe(true)

      storage.pwaDismissed.clear()
      expect(storage.pwaDismissed.get()).toBe(false)
    })

    it('manages lastSearch query and enforces max length', () => {
      expect(storage.lastSearch.get()).toBe('')

      storage.lastSearch.set('تيل فرامل أباتشي')
      expect(storage.lastSearch.get()).toBe('تيل فرامل أباتشي')

      // Huge input truncation to 100 chars
      const hugeQuery = 'X'.repeat(500)
      storage.lastSearch.set(hugeQuery)
      expect(storage.lastSearch.get().length).toBe(100)

      storage.lastSearch.clear()
      expect(storage.lastSearch.get()).toBe('')
    })

    it('manages vehicleFilter storage with validation', () => {
      expect(storage.vehicleFilter.get()).toEqual({})

      const filter = {
        modelId: 'model-hlx-150',
        year: 2022,
        categoryId: 'cat-brakes',
      }
      storage.vehicleFilter.set(filter)
      expect(storage.vehicleFilter.get()).toEqual(filter)

      // Corrupt vehicle filter data in localStorage
      localStorage.setItem(STORAGE_KEYS.VEHICLE_FILTER, '{"year": "invalid-year-type"}')
      expect(storage.vehicleFilter.get()).toEqual({})

      storage.vehicleFilter.clear()
      expect(storage.vehicleFilter.get()).toEqual({})
    })
  })
})
