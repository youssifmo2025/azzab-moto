import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from '@/app/layouts/MainLayout'
import { ErrorBoundary } from '@/app/layouts/ErrorBoundary'
import NotFoundPage from '@/app/layouts/NotFoundPage'

// ── Lazy-loaded page components ──────────────────────────────────────────────
const HomePage = lazy(() => import('@/features/static-pages/pages/HomePage'))
const CatalogPage = lazy(() => import('@/features/catalog/pages/CatalogPage'))
const CategoryPage = lazy(() => import('@/features/catalog/pages/CategoryPage'))
const ProductPage = lazy(() => import('@/features/product/pages/ProductPage'))
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage'))
const AboutPage = lazy(() => import('@/features/static-pages/pages/AboutPage'))
const ContactPage = lazy(() => import('@/features/static-pages/pages/ContactPage'))
const PrivacyPage = lazy(() => import('@/features/static-pages/pages/PrivacyPage'))
const ReturnsPage = lazy(() => import('@/features/static-pages/pages/ReturnsPage'))

/** Minimal inline spinner for Suspense fallback during code-split loading */
function PageLoader() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label="جارٍ تحميل الصفحة"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
    </div>
  )
}

/** Wrap a page element in Suspense so lazy loads are handled gracefully */
function Page({ element }: { element: React.ReactElement }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{element}</Suspense>
    </ErrorBoundary>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <MainLayout />,
    children: [
      {
        index: true,
        element: <Page element={<HomePage />} />,
      },
      {
        path: 'catalog',
        element: <Page element={<CatalogPage />} />,
      },
      {
        path: 'catalog/category/:slug',
        element: <Page element={<CategoryPage />} />,
      },
      {
        path: 'products/:slug',
        element: <Page element={<ProductPage />} />,
      },
      {
        path: 'search',
        element: <Page element={<SearchPage />} />,
      },
      {
        path: 'about',
        element: <Page element={<AboutPage />} />,
      },
      {
        path: 'contact',
        element: <Page element={<ContactPage />} />,
      },
      {
        path: 'privacy',
        element: <Page element={<PrivacyPage />} />,
      },
      {
        path: 'returns',
        element: <Page element={<ReturnsPage />} />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
