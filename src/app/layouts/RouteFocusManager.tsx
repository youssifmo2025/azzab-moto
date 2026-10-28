import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Ensures accessible focus management on client-side route transitions:
 * 1. Scrolls viewport instantly to top.
 * 2. Focuses #main-content so screen readers start reading the new page content.
 */
export function RouteFocusManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)

    const mainEl = document.getElementById('main-content')
    if (mainEl) {
      mainEl.focus({ preventScroll: true })
    }
  }, [pathname])

  return null
}
