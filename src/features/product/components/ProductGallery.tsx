import { useState, useRef, type KeyboardEvent } from 'react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
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
          <div className="flex flex-col items-center justify-center text-secondary/60">
            <svg
              className="h-20 w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="mt-2 text-xs font-medium text-body">
              قطع غيار TVS الأصلية — عزاب موتو
            </span>
          </div>
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
