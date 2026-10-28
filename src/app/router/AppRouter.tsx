import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { MainLayout } from '@/app/layouts/MainLayout'
import { ErrorBoundary } from '@/app/layouts/ErrorBoundary'
import NotFoundPage from '@/app/layouts/NotFoundPage'
import { AdminAuthProvider } from '@/admin/context/AdminAuthContext'

// ── Lazy-loaded public page components ───────────────────────────────────────
const HomePage = lazy(() => import('@/features/static-pages/pages/HomePage'))
const CatalogPage = lazy(() => import('@/features/catalog/pages/CatalogPage'))
const CategoryPage = lazy(() => import('@/features/catalog/pages/CategoryPage'))
const ProductPage = lazy(() => import('@/features/product/pages/ProductPage'))
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage'))
const AboutPage = lazy(() => import('@/features/static-pages/pages/AboutPage'))
const ContactPage = lazy(() => import('@/features/static-pages/pages/ContactPage'))
const PrivacyPage = lazy(() => import('@/features/static-pages/pages/PrivacyPage'))
const ReturnsPage = lazy(() => import('@/features/static-pages/pages/ReturnsPage'))
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('@/features/checkout/pages/OrderConfirmationPage'))

// ── Lazy-loaded admin page components (Isolated in Admin Chunk) ──────────────
const AdminLayout = lazy(() => import('@/admin/components/AdminLayout'))
const AdminLoginPage = lazy(() => import('@/admin/pages/AdminLoginPage'))
const AdminChangePasswordPage = lazy(() => import('@/admin/pages/AdminChangePasswordPage'))
const AdminDashboardPage = lazy(() => import('@/admin/pages/AdminDashboardPage'))
const AdminOrdersPage = lazy(() => import('@/admin/pages/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('@/admin/pages/AdminOrderDetailPage'))
const AdminProductsPage = lazy(() => import('@/admin/pages/AdminProductsPage'))
const AdminProductEditPage = lazy(() => import('@/admin/pages/AdminProductEditPage'))
const AdminCategoriesPage = lazy(() => import('@/admin/pages/AdminCategoriesPage'))
const AdminUsersPage = lazy(() => import('@/admin/pages/AdminUsersPage'))

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

/** Admin root wrapper providing AdminAuthProvider to all admin subroutes */
function AdminRoot() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  )
}

const router = createBrowserRouter([
  // ── Public Store Routes ───────────────────────────────────────────────────
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
        path: 'cart',
        element: <Page element={<CartPage />} />,
      },
      {
        path: 'checkout',
        element: <Page element={<CheckoutPage />} />,
      },
      {
        path: 'order/confirmation',
        element: <Page element={<OrderConfirmationPage />} />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },

  // ── Admin Protected & Isolated Routes ─────────────────────────────────────
  {
    path: '/admin',
    element: <AdminRoot />,
    children: [
      {
        path: 'login',
        element: <Page element={<AdminLoginPage />} />,
      },
      {
        element: <Page element={<AdminLayout />} />,
        children: [
          {
            index: true,
            element: <Page element={<AdminDashboardPage />} />,
          },
          {
            path: 'change-password',
            element: <Page element={<AdminChangePasswordPage />} />,
          },
          {
            path: 'orders',
            element: <Page element={<AdminOrdersPage />} />,
          },
          {
            path: 'orders/:id',
            element: <Page element={<AdminOrderDetailPage />} />,
          },
          {
            path: 'products',
            element: <Page element={<AdminProductsPage />} />,
          },
          {
            path: 'products/new',
            element: <Page element={<AdminProductEditPage />} />,
          },
          {
            path: 'products/:id',
            element: <Page element={<AdminProductEditPage />} />,
          },
          {
            path: 'categories',
            element: <Page element={<AdminCategoriesPage />} />,
          },
          {
            path: 'users',
            element: <Page element={<AdminUsersPage />} />,
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
