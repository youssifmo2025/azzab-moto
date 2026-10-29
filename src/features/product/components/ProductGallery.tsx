import { ProductFallbackImage } from '@/shared/components/ProductFallbackImage'
import { useState, useRef, type KeyboardEvent } from 'react'

interface ProductGalleryProps {
  images: string[]
  productName: string
  categoryId?: string
}

export function ProductGallery({ images, productName, categoryId }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [imgError, setImgError] = useState<Record<number, boolean>>({})
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([])

  const currentImage = images[selectedIndex] || images[0]

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (images.length <= 1) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (selectedIndex + 1) % images.length
      setSelectedIndex(next)
      thumbnailRefs.current[next]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (selectedIndex - 1 + images.length) % images.length
      setSelectedIndex(prev)
      thumbnailRefs.current[prev]?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Large Hero Image on Pure White Background */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[12px] border border-border bg-white p-6 shadow-xs">
        {imgError[selectedIndex] || !currentImage ? (
          <ProductFallbackImage categoryId={categoryId} productName={productName} />
        ) : (
          <img
            src={currentImage}
            alt={`صورة ${productName} - صورة رقم ${selectedIndex + 1}`}
            width={600}
            height={600}
            loading="eager"
            onError={() => setImgError((prev) => ({ ...prev, [selectedIndex]: true }))}
            className="h-full w-full object-contain transition duration-200"
          />
        )}
      </div>

      {/* Thumbnails Row (Only if multiple images) */}
      {images.length > 1 && (
        <div
          role="radiogroup"
          aria-label="الصور المصغرة للمنتج"
          onKeyDown={handleKeyDown}
          className="flex items-center gap-3 overflow-x-auto pb-2"
        >
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx
            return (
              <button
                key={idx}
                ref={(el) => {
                  thumbnailRefs.current[idx] = el
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`عرض الصورة رقم ${idx + 1}`}
                onClick={() => setSelectedIndex(idx)}
                className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-[8px] border-2 bg-white p-1 transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'border-accent shadow-xs'
                    : 'border-border/60 hover:border-border opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt=""
                  width={72}
                  height={72}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
