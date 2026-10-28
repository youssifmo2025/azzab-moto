import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AlertCircle, Home, ShoppingBag } from 'lucide-react'
import { siteConfig } from '@/app/config/site'

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>{`الصفحة غير موجودة (404) — ${siteConfig.name}`}</title>
      </Helmet>
      <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-promo text-accent">
          <AlertCircle className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold text-heading">
          عذراً، هذه الصفحة غير موجودة
        </h1>
        <p className="mt-3 text-body">
          يبدو أن الرابط الذي اتبعته غير صحيح أو تم نقل الصفحة إلى عنوان آخر.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </Link>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface px-5 py-2.5 font-medium text-heading transition hover:bg-alt"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>تصفح الكتالوج</span>
          </Link>
        </div>
      </div>
    </>
  )
}
