/**
 * Mock Service Worker (MSW) bootstrap.
 *
 * NOTE: This function is guarded by `import.meta.env.DEV`.
 * In production builds, Vite dead-code elimination eliminates MSW and all its handlers entirely,
 * guaranteeing 0 kB added to the production client bundle.
 */
export async function enableMocking(): Promise<void> {
  if (import.meta.env.DEV && import.meta.env.VITE_DATA_SOURCE === 'api') {
    const { worker } = await import('./browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
  }
}

