import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react'
import type { Product } from '@/services/schemas/product'
import { formatPrice } from '@/shared/utils/formatPrice'
import { buildWhatsAppUrl, buildOrderMessage } from '@/shared/lib/whatsapp'
import { useModels } from '@/features/vehicle-selector/hooks/useModels'
import { features } from '@/app/config/features'
import { useCart } from '@/features/cart/context/CartContext'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { models } = useModels()
  const { addItem } = useCart()
  const [imgError, setImgError] = useState(false)

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

  return (
    <article className="group flex flex-col justify-between rounded-[10px] border border-border bg-surface p-4 card-hover">
      {/* Top Media & Details link */}
      <div>
        <Link
          to={`/products/${product.slug}`}
          className="block focus-visible:outline-accent"
          aria-label={`عرض تفاصيل ${product.name}`}
        >
          {/* Product Image on white background with fixed aspect ratio */}
          <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[8px] bg-white p-2 border border-border/40">
            {imgError || !product.images[0] ? (
              <div className="flex flex-col items-center justify-center text-secondary/60">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="mt-1 text-[11px]">عزاب موتو TVS</span>
              </div>
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

      {/* Bottom Price & Order CTA */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <div>
          <span className="font-numeric tabular text-base font-extrabold text-accent sm:text-lg">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Order or Add to Cart CTA */}
        {features.cart ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              addItem(product, 1)
            }}
            aria-label={`إضافة ${product.name} إلى السلة`}
            className="btn-press inline-flex items-center gap-1.5 rounded-[8px] bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition duration-150 hover:bg-accent-hover cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
            <span>أضف للسلة</span>
          </button>
        ) : (
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`طلب ${product.name} عبر واتساب`}
            className="btn-press inline-flex items-center gap-1.5 rounded-[8px] border border-accent bg-transparent px-3 py-1.5 text-xs font-semibold text-accent transition duration-150 hover:bg-accent hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>اطلب</span>
          </a>
        )}
      </div>
    </article>
  )
}
