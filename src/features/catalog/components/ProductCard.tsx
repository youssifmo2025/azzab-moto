import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, CheckCircle2, AlertCircle, ShoppingBag, Check } from 'lucide-react'
import type { Product } from '@/services/schemas/product'
import { formatPrice } from '@/shared/utils/formatPrice'
import { buildWhatsAppUrl, buildOrderMessage } from '@/shared/lib/whatsapp'
import { useModels } from '@/features/vehicle-selector/hooks/useModels'
import { features } from '@/app/config/features'
import { useCart } from '@/features/cart/context/CartContext'
import { ProductFallbackImage } from '@/shared/components/ProductFallbackImage'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { models } = useModels()
  const { addItem } = useCart()
  const [imgError, setImgError] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  // Derive model names for compatibility display
  const compatibleModelNames = product.compatibility
    .map((c) => {
      const match = models.find((m) => m.id === c.modelId)
      return match ? match.name : c.modelId
    })
    .slice(0, 2)
    .join(' · ')

  const whatsappOrderUrl = buildWhatsAppUrl(
    buildOrderMessage({
      productName: product.name,
      sku: product.sku,
      partNumber: product.partNumber || undefined,
      price: product.price,
    }),
  )

  const isAvailable = product.availability === 'in_stock'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product, 1)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1200)
  }

  return (
    <article className="group flex flex-col justify-between rounded-[12px] border border-border bg-surface p-4 card-hover overflow-hidden">
      {/* Top Media & Details link */}
      <div>
        <Link
          to={`/products/${product.slug}`}
          className="block focus-visible:outline-accent"
          aria-label={`عرض تفاصيل ${product.name}`}
        >
          {/* Product Image on white background with fixed aspect ratio */}
          <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[8px] bg-white p-3 border border-border/60 shadow-2xs">
            {imgError || !product.images[0] ? (
              <ProductFallbackImage categoryId={product.categoryId} productName={product.name} />
            ) : (
              <img
                src={product.images[0]}
                alt={`صورة ${product.name} أصلية TVS`}
                width={300}
                height={300}
                loading={priority ? 'eager' : 'lazy'}
                onError={() => setImgError(true)}
                className="h-full w-full object-contain img-hover-zoom"
              />
            )}

            {/* In-stock tag */}
            <span
              className={`absolute top-2 start-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isAvailable ? 'bg-success/10 text-success' : 'bg-alt text-secondary'
              }`}
            >
              {isAvailable ? (
                <>
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span>متوفر</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  <span>بالطلب</span>
                </>
              )}
            </span>
          </div>

          {/* Compatible Models small line */}
          {compatibleModelNames && (
            <p className="mb-1 truncate text-xs text-secondary font-medium">
              {compatibleModelNames}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-heading text-sm font-bold text-heading line-clamp-2 transition group-hover:text-accent">
            {product.name}
          </h3>

          {/* SKU / Part Number */}
          <p className="mt-1 font-numeric tabular text-[11px] text-body/70">SKU: {product.sku}</p>
        </Link>
      </div>

      {/* Bottom Price & Order CTA — prominent charcoal price with muted EGP suffix */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="font-numeric tabular text-[19px] font-extrabold text-heading leading-none">
            {formatPrice(product.price, { showCurrency: false })}
          </span>
          <span className="text-xs font-semibold text-secondary">
            ج.م
          </span>
        </div>

        {/* Order or Add to Cart CTA with momentary success state */}
        {features.cart ? (
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`إضافة ${product.name} إلى السلة`}
            className={`btn-primary px-3 py-1.5 text-xs font-semibold shadow-xs cursor-pointer transition-all duration-200 group-hover:shadow-sm ${
              isAdded ? 'bg-success text-white' : ''
            }`}
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                <span>تمت الإضافة!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        ) : (
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`طلب ${product.name} عبر واتساب`}
            className="btn-secondary-outline px-3 py-1.5 text-xs font-semibold border-accent text-accent hover:bg-accent hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5 me-1" aria-hidden="true" />
            <span>اطلب</span>
          </a>
        )}
      </div>
    </article>
  )
}
