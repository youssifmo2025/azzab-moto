import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ChevronLeft,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  Plus,
  Minus,
} from 'lucide-react'
import { siteConfig } from '@/app/config/site'
import { features } from '@/app/config/features'
import { useCart } from '@/features/cart/context/CartContext'
import { useProduct } from '../hooks/useProduct'
import { useCategories } from '@/features/catalog/hooks/useCategories'
import { useProducts } from '@/features/catalog/hooks/useProducts'
import { ProductGallery } from '../components/ProductGallery'
import { CompatibilityChecker } from '../components/CompatibilityChecker'
import { CompatibilityTable } from '../components/CompatibilityTable'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import NotFoundPage from '@/app/layouts/NotFoundPage'
import { formatPrice } from '@/shared/utils/formatPrice'
import { buildWhatsAppUrl, buildOrderMessage } from '@/shared/lib/whatsapp'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { product, loading } = useProduct(slug)
  const { categories } = useCategories()
  const { products: allProducts } = useProducts()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const category = useMemo(() => {
    if (!product) return null
    return categories.find((c) => c.id === product.categoryId)
  }, [product, categories])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4)
  }, [product, allProducts])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="h-4 w-48 rounded bg-alt mb-8" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-[12px] bg-alt" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-alt" />
            <div className="h-4 w-1/3 rounded bg-alt" />
            <div className="h-10 w-1/2 rounded bg-alt" />
            <div className="h-32 rounded bg-alt" />
          </div>
        </div>
      </div>
    )
  }

  // 404 for unknown slug
  if (!product) {
    return <NotFoundPage />
  }

  const productUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `${siteConfig.siteUrl}/products/${product.slug}`

  const whatsappOrderUrl = buildWhatsAppUrl(
    buildOrderMessage({
      productName: product.name,
      sku: product.sku,
      partNumber: product.partNumber || undefined,
      price: product.price,
      productUrl,
    }),
  )

  const isAvailable = product.availability === 'in_stock'

  // JSON-LD Product Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    mpn: product.partNumber || product.sku,
    brand: {
      '@type': 'Brand',
      name: 'TVS',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: product.price,
      availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      url: productUrl,
    },
  }

  return (
    <>
      <Helmet>
        <title>{`${product.name} — ${siteConfig.name}`}</title>
        <meta name="description" content={product.description} />
        <link rel="canonical" href={productUrl} />

        {/* Open Graph Tags */}
        <meta property="og:title" content={`${product.name} — ${siteConfig.name}`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:type" content="product" />
        {product.images[0] && <meta property="og:image" content={product.images[0]} />}

        {/* Structured Data JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 sm:py-10">
        {/* Breadcrumbs */}
        <nav
          aria-label="مسار التنقل"
          className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-secondary"
        >
          <Link to="/" className="hover:text-heading">
            الرئيسية
          </Link>
          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
          <Link to="/catalog" className="hover:text-heading">
            الكتالوج
          </Link>
          {category && (
            <>
              <ChevronLeft className="h-3 w-3" aria-hidden="true" />
              <Link to={`/catalog/category/${category.slug}`} className="hover:text-heading">
                {category.name}
              </Link>
            </>
          )}
          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
          <span className="font-medium text-heading truncate max-w-xs" aria-current="page">
            {product.name}
          </span>
        </nav>

        {/* Main Product Layout: Gallery (Right) & Details (Left) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery Right */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Details Left */}
          <div className="space-y-6">
            <div>
              {/* Availability Badge in Green */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    isAvailable ? 'bg-success/10 text-success' : 'bg-alt text-secondary'
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>متوفر في المخزن — جاهز للشحن</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>متوفر بالطلب</span>
                    </>
                  )}
                </span>

                <span className="text-xs text-secondary">قطع غيار أصلية TVS</span>
              </div>

              {/* Product Name */}
              <h1 className="font-heading text-2xl font-extrabold text-heading sm:text-3xl leading-snug">
                {product.name}
              </h1>

              {/* English Name */}
              {product.nameEn && (
                <p className="mt-1 text-sm text-secondary font-medium font-numeric tabular">
                  {product.nameEn}
                </p>
              )}

              {/* SKU & Part Number in Tabular Font */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-numeric tabular text-body">
                <span className="rounded-[6px] border border-border bg-alt px-2.5 py-1">
                  كود SKU: <strong className="text-heading">{product.sku}</strong>
                </span>
                {product.partNumber && (
                  <span className="rounded-[6px] border border-border bg-alt px-2.5 py-1">
                    رقم القطعة (OEM): <strong className="text-heading">{product.partNumber}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Large Orange Price in Tabular Font */}
            <div className="rounded-[10px] border border-border/80 bg-surface p-4">
              <span className="block text-xs text-secondary font-medium mb-1">
                السعر للمستهلك (شامل الضريبة)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-numeric tabular text-3xl font-extrabold text-accent sm:text-4xl">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Order Action Buttons */}
            <div className="space-y-3">
              {features.cart && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-[10px] border border-border bg-base p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-secondary hover:text-heading cursor-pointer"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-bold font-numeric tabular text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 text-secondary hover:text-heading cursor-pointer"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => addItem(product, quantity)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-[10px] bg-accent py-3.5 px-6 font-heading text-base font-bold text-white shadow-xs transition duration-150 hover:bg-accent-hover cursor-pointer"
                  >
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                    <span>أضف إلى السلة</span>
                  </button>
                </div>
              )}

              {features.whatsappOrder && (
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-[10px] font-heading font-semibold shadow-xs transition duration-150 ${
                    features.cart
                      ? 'border border-border bg-base py-2.5 px-4 text-xs text-secondary hover:bg-neutral-light hover:text-heading'
                      : 'bg-accent py-3.5 px-6 text-base text-white hover:bg-accent-hover font-bold'
                  }`}
                >
                  <MessageCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>اطلب عبر واتساب</span>
                </a>
              )}
            </div>

            {/* Quick Guarantees Strip */}
            <div className="grid grid-cols-3 gap-3 border-y border-border py-4 text-center text-xs text-body">
              <div className="flex flex-col items-center gap-1">
                <CreditCard className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>دفع عند الاستلام</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>شحن لكل المحافظات</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>مطابقة أصلية 100%</span>
              </div>
            </div>

            {/* "هل القطعة مناسبة لموتوسيكلك؟" Box */}
            <CompatibilityChecker compatibilityList={product.compatibility} />

            {/* Description */}
            <div className="pt-2">
              <h2 className="font-heading text-base font-bold text-heading mb-2">
                وصف ومواصفات القطعة
              </h2>
              <p className="text-sm leading-relaxed text-body whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Full Compatibility Section: Thin-lined table per brief */}
        <div className="mt-14 rounded-[12px] border border-border bg-surface p-6 sm:p-8">
          <div className="mb-4">
            <h2 className="font-heading text-lg font-bold text-heading sm:text-xl">
              جدول توافق الموديلات التفصيلي
            </h2>
            <p className="mt-1 text-xs text-body">
              قائمة موديلات وسنوات تصنيع دراجات TVS المتوافقة هندسياً مع هذه القطعة
            </p>
          </div>

          <CompatibilityTable compatibility={product.compatibility} />
        </div>

        {/* Related Products from same category */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-heading sm:text-2xl">
                قطع غيار أخرى في قسم {category?.name || 'الكتالوج'}
              </h2>
              {category && (
                <Link
                  to={`/catalog/category/${category.slug}`}
                  className="text-xs font-semibold text-accent transition hover:text-accent-hover"
                >
                  عرض المزيد
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA on Mobile per brief */}
      <div className="fixed bottom-0 start-0 end-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-xs shadow-lg md:hidden">
        <div>
          <span className="block text-[10px] text-secondary font-medium">السعر</span>
          <span className="font-numeric tabular text-lg font-extrabold text-accent">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {features.cart && (
            <button
              type="button"
              onClick={() => addItem(product, 1)}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-accent-hover cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span>أضف للسلة</span>
            </button>
          )}
          {features.whatsappOrder && (
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-base px-3 py-2 text-xs font-semibold text-heading shadow-xs transition hover:bg-neutral-light"
              aria-label="طلب عبر واتساب"
            >
              <MessageCircle className="h-4 w-4 text-accent" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </>
  )
}
