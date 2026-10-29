import { Outlet } from 'react-router-dom'
import { Header } from './Header/Header'
import { Footer } from './Footer'
import { RouteFocusManager } from './RouteFocusManager'
import { PwaInstallPrompt } from '@/shared/ui/PwaInstallPrompt'
import { CartProvider } from '@/features/cart/context/CartContext'
import { CartDrawer } from '@/features/cart/components/CartDrawer'

export function MainLayout() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-base text-body font-body selection:bg-accent/20 selection:text-accent bg-showroom-ambient">
        {/* 1. Skip-to-content accessibility link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:rounded-[10px] focus:bg-accent focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          انتقل إلى المحتوى الرئيسي
        </a>

        {/* 2. Route focus and scroll restoration */}
        <RouteFocusManager />

        {/* 3. Sticky White Header with Sand Strip & Search */}
        <Header />

        {/* 4. Main Page View Outlet */}
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          <Outlet />
        </main>

        {/* 5. Light Sand Showroom Footer */}
        <Footer />

        {/* 6. PWA Soft Install Prompt */}
        <PwaInstallPrompt />

        {/* 7. Slide-over Cart Drawer */}
        <CartDrawer />
      </div>
    </CartProvider>
  )
}
