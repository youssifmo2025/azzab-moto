import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { siteConfig } from '@/app/config/site'

export function AnnouncementStrip() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const announcements = siteConfig.announcements
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isPaused || prefersReducedMotion || announcements.length <= 1) {
      return
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 4500)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPaused, announcements.length])

  if (!announcements.length) return null

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  return (
    <aside
      aria-label="إعلانات المتجر"
      className="border-b border-border bg-alt py-1.5 text-xs text-body"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:justify-center">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="الإعلان السابق"
          className="flex h-5 w-5 items-center justify-center rounded text-secondary transition hover:text-heading sm:hidden"
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="truncate text-center font-medium text-heading"
        >
          <span>{announcements[currentIndex]}</span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="الإعلان التالي"
          className="flex h-5 w-5 items-center justify-center rounded text-secondary transition hover:text-heading sm:hidden"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
