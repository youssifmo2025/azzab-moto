import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, MessageCircle, ShoppingBag, Info, Phone, ShieldCheck, Home } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { siteConfig } from '@/app/config/site'
import { features } from '@/app/config/features'
import { useCart } from '@/features/cart/context/CartContext'
import { buildWhatsAppUrl } from '@/shared/lib/whatsapp'
import { SearchBar } from './Header/SearchBar'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const location = useLocation()
  const { itemCount } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Close drawer on route change
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Close drawer on Escape key and trap basic focus
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scrolling when drawer is open
    document.body.style.overflow = 'hidden'

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const whatsappUrl = buildWhatsAppUrl('السلام عليكم، أود الاستفسار عن قطع غيار TVS.')

  return (
    <div
      className="fixed inset-0 z-50 flex md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="القائمة الرئيسية"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-heading/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content (White side drawer from start/right) */}
      <div
        ref={drawerRef}
        className="relative z-10 flex h-full w-4/5 max-w-xs flex-col bg-surface shadow-2xl border-s border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-black p-1 shadow-xs">
              <img src={logoImg} alt={siteConfig.name} className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-heading">{siteConfig.name}</span>
              {siteConfig.isAuthorizedDealer && (
                <span className="block text-[10px] text-accent font-medium">وكيل معتمد TVS</span>
              )}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-secondary hover:bg-alt hover:text-heading"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Search inside Drawer */}
        <div className="p-4 border-b border-border bg-base/50">
          <SearchBar onSearchSubmit={onClose} />
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-heading hover:bg-alt"
          >
            <Home className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span>الرئيسية</span>
          </Link>
          <Link
            to="/catalog"
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-heading hover:bg-alt"
          >
            <ShoppingBag className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span>كتالوج قطع الغيار</span>
          </Link>
          {features.cart && (
            <Link
              to="/cart"
              className="flex items-center justify-between rounded-[10px] px-3 py-2.5 text-sm font-medium text-heading hover:bg-alt"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>سلة المشتريات</span>
              </div>
              {itemCount > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white font-numeric tabular">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          <Link
            to="/about"
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-heading hover:bg-alt"
          >
            <Info className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span>من نحن</span>
          </Link>
          <Link
            to="/contact"
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-heading hover:bg-alt"
          >
            <Phone className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span>تواصل معنا</span>
          </Link>
          <Link
            to="/returns"
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-heading hover:bg-alt"
          >
            <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span>الاستبدال والاسترجاع</span>
          </Link>
        </nav>

        {/* Drawer Footer CTA */}
        <div className="border-t border-border p-4 bg-alt/50">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover shadow-xs"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>طلب عبر واتساب</span>
          </a>
        </div>
      </div>
    </div>
  )
}
