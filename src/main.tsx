import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

async function prepareApp() {
  if (
    (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') &&
    (import.meta.env.VITE_DATA_SOURCE === 'api' || import.meta.env.VITE_DEMO_MODE === 'true')
  ) {
    const { enableMocking } = await import('./services/mock')
    await enableMocking()
  }
}

prepareApp().then(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})

// Register PWA service worker in production
if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      // Safe non-blocking warning
      console.warn('ServiceWorker registration error:', err)
    })
  })
}
