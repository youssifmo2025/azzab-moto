import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, MessageCircle, Search } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { siteConfig } from '@/app/config/site'
import { features } from '@/app/config/features'
import { buildWhatsAppUrl } from '@/shared/lib/whatsapp'
import { AnnouncementStrip } from './AnnouncementStrip'
import { SearchBar } from './SearchBar'
import { MobileDrawer } from '../MobileDrawer'
import { CartIcon } from '@/features/cart/components/CartIcon'

export function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const quickWhatsappUrl = buildWhatsAppUrl('السلام عليكم، أود الاستفسار عن قطع غيار TVS.')

  return (
    <header className="sticky top-0 z-40 w-full bg-surface shadow-xs">
      {/* 1. Sand Announcement Strip */}
      <AnnouncementStrip />

      {/* 2. Main Navigation Bar (Low height showroom header) */}
      <div className="border-b border-border bg-surface">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:h-18">
          {/* Logo & Dealer Label */}
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="فتح القائمة الرئيسية"
              className="flex h-10 w-10 items-center justify-center rounded-[8px] text-secondary hover:bg-alt hover:text-heading md:hidden"
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

          {/* Actions & Enabled Feature Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              aria-label="فتح شريط البحث"
              className="flex h-10 w-10 items-center justify-center rounded-[8px] text-secondary hover:bg-alt hover:text-accent md:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Catalog direct link (Starter feature: ON) */}
            {features.catalog && (
              <Link
                to="/catalog"
                className="hidden text-sm font-medium text-heading transition hover:text-accent lg:inline-flex"
              >
                كتالوج القطع
              </Link>
            )}

            {/* Shopping Cart (Business Feature: ON) */}
            {features.cart && <CartIcon />}

            {/* Direct WhatsApp Action (Starter feature: ON) */}
            {features.whatsappOrder && (
              <a
                href={quickWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تواصل واطلب عبر واتساب مباشرة"
                className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-hover sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden xs:inline">اطلب عبر واتساب</span>
              </a>
            )}

            {/* NOTE: Disabled features in Starter: cart, favorites, account
                are deliberately NOT rendered per AGENTS.md instructions. */}
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
