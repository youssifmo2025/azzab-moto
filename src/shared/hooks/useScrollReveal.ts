import { useEffect, useRef } from 'react'

/**
 * Scroll-reveal hook using IntersectionObserver.
 * Applies fade + 12px upward rise on entry.
 * Fully disabled under prefers-reduced-motion.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    // Initial hidden state
    el.style.opacity = '0'
    el.style.transform = 'translateY(12px)'
    el.style.transition =
      'opacity 400ms cubic-bezier(0.25,0.46,0.45,0.94), transform 400ms cubic-bezier(0.25,0.46,0.45,0.94)'

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
            observer.disconnect()
          }
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
