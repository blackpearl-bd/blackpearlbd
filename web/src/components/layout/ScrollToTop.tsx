import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls the AppShell's overflow-y-auto container to the top on route change.
 * The site uses a nested scroll container (div.overflow-y-auto) instead of
 * window, so React Router's default scroll restoration doesn't apply.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const container = document.querySelector('.overflow-y-auto')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname])

  return null
}
