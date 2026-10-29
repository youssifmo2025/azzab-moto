import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, MessageCircle, Search, Shield } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { siteConfig } from '@/app/config/site'
import { features } from '@/app/config/features'
import { buildWhatsAppUrl } from '@/shared/lib/whatsapp'
import { AnnouncementStrip } from './AnnouncementStrip'
import { SearchBar } from './SearchBar'
import { MobileDrawer } from '../MobileDrawer'
import { CartIcon } from '@/features/cart/components/CartIcon'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const quickWhatsappUrl = buildWhatsAppUrl('السلام عليكم، أود الاستفسار عن قطع غيار TVS.')

  const isCatalogActive =
    location.pathname === '/catalog' || location.pathname.startsWith('/catalog/')
  const isTrackingActive = location.pathname === '/track'

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-surface transition-shadow duration-200 ${
        isScrolled ? 'shadow-md border-b border-border/80' : 'shadow-xs border-b border-border/40'
      }`}
    >
      {/* 1. Sand Announcement Strip */}
      <AnnouncementStrip />

      {/* 2. Main Navigation Bar (Low height showroom header) */}
      <div className="bg-surface">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:h-18">
          {/* Logo & Dealer Label */}
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="فتح القائمة الرئيسية"
              className="btn-icon flex h-10 w-10 items-center justify-center rounded-[8px] text-secondary hover:bg-alt hover:text-heading md:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              to="/"
              className="flex items-center gap-3 focus-visible:outline-accent"
              aria-label={`${siteConfig.name} — الصفحة الرئيسية`}
            >
              {/* Logo in a small rounded dark card per design brief */}
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-black p-1 shadow-xs transition hover:opacity-90 sm:h-11 sm:w-11">
                <img src={logoImg} alt="شعار عزاب موتو" className="h-full w-full object-contain" />
              </div>

              <div className="flex flex-col">
                <span className="font-heading text-lg font-extrabold tracking-tight text-heading sm:text-xl">
                  {siteConfig.name}
                </span>
                {/* Render authorized dealer label ONLY if isAuthorizedDealer is true */}
                {siteConfig.isAuthorizedDealer && (
                  <span className="text-[11px] font-semibold text-accent leading-none">
                    وكيل معتمد TVS
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Wide Search Bar in the middle */}
          <div className="mx-4 hidden max-w-lg flex-1 md:block">
            <SearchBar />
          </div>

          {/* Desktop Navigation Links — 28-32px gap, 15-16px weight-600, min 44px hit area */}
          <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-7 xl:gap-8 mx-2">
            {features.catalog && (
              <Link
                to="/catalog"
                aria-current={isCatalogActive ? 'page' : undefined}
                className={`text-btn text-btn-default min-h-[44px] py-2.5 px-1 text-[15px] font-semibold ${
                  isCatalogActive ? 'is-active' : ''
                }`}
              >
                كتالوج القطع
              </Link>
            )}

            {features.orderTracking && (
              <Link
                to="/track"
                aria-current={isTrackingActive ? 'page' : undefined}
                className={`text-btn text-btn-default min-h-[44px] py-2.5 px-1 text-[15px] font-semibold ${
                  isTrackingActive ? 'is-active' : ''
                }`}
              >
                تتبع الطلب
              </Link>
            )}
          </nav>

          {/* Actions & Enabled Feature Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              aria-label="فتح شريط البحث"
              className="btn-icon flex h-10 w-10 items-center justify-center rounded-[8px] text-secondary hover:bg-alt hover:text-accent md:hidden cursor-pointer"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Admin Portal Button */}
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              aria-label="لوحة الإدارة"
              title="لوحة الإدارة"
              className="btn-icon hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-base text-secondary transition hover:border-accent hover:text-accent cursor-pointer"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Shopping Cart */}
            {features.cart && <CartIcon />}

            {/* Direct WhatsApp Action */}
            {features.whatsappOrder && (
              <a
                href={quickWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تواصل واطلب عبر واتساب مباشرة"
                className="btn-primary px-3 py-2 text-xs font-semibold sm:px-4 sm:py-2.5 sm:text-sm cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 me-1.5" aria-hidden="true" />
                <span className="hidden xs:inline">اطلب عبر واتساب</span>
              </a>
            )}
          </div>
        </div>

        {/* Mobile search expander */}
        {isMobileSearchOpen && (
          <div className="border-t border-border bg-base px-4 py-3 md:hidden">
            <SearchBar onSearchSubmit={() => setIsMobileSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  )
}
