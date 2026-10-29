import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Bike } from 'lucide-react'
import { useModels } from '@/features/vehicle-selector/hooks/useModels'
import { useProducts } from '@/features/catalog/hooks/useProducts'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'
import { ProductFallbackImage } from '@/shared/components/ProductFallbackImage'
import type { Model } from '@/services/schemas/model'

interface ModelCardProps {
  model: Model
  partsCount: number
}

function ModelCard({ model, partsCount }: ModelCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      to={`/catalog?modelId=${model.id}`}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-border/80 bg-surface card-hover shadow-2xs transition-all duration-300"
    >
      {/* Real motorcycle studio photography on clean light background — edge-to-edge media area */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-alt/30 flex items-center justify-center">
        {imgError ? (
          <ProductFallbackImage isMotorcycle productName={model.name} />
        ) : (
          <img
            src={model.imageUrl}
            alt={`دراجة ${model.name} — قطع غيار أصلية TVS`}
            width={360}
            height={270}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}

        {/* Prominent model type badge */}
        <span className="absolute bottom-2.5 start-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-bold text-heading shadow-xs backdrop-blur-xs border border-border/80">
          <Bike className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>{(model.nameAr || model.name).split(' ')[0]}</span>
        </span>
      </div>

      <div className="p-3.5 sm:p-4">
        <h3 className="font-heading text-sm font-bold text-heading transition group-hover:text-accent">
          {model.name}
        </h3>
        <p className="mt-1 text-xs text-body">
          {partsCount > 0 ? (
            <>
              <span className="font-numeric tabular font-bold text-heading">{partsCount}</span>{' '}
              <span>قطعة غيار متوفرة</span>
            </>
          ) : (
            'قطع غيار أصلية'
          )}
        </p>
      </div>
    </Link>
  )
}

export function ModelsSection() {
  const { models } = useModels()
  const { products } = useProducts()
  const ref = useScrollReveal<HTMLElement>()

  return (
    <section ref={ref} aria-labelledby="models-heading" className="bg-base py-14 sm:py-18">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              موديلات TVS
            </p>
            <h2
              id="models-heading"
              className="mt-1 font-heading text-2xl font-extrabold text-heading sm:text-3xl"
            >
              تصفح قطع الغيار حسب الموديل
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-btn text-btn-accent hidden sm:inline-flex text-sm"
          >
            <span>كل الموديلات</span>
            <ChevronLeft className="h-4 w-4 text-btn-arrow text-btn-arrow-forward" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {models.map((model, idx) => {
            const partsCount = products.filter((p) =>
              p.compatibility.some((c) => c.modelId === model.id),
            ).length

            const staggerClass = idx < 6 ? `stagger-${idx + 1} animate-fade-in-up` : 'animate-fade-in-up'

            return (
              <div key={model.id} className={staggerClass}>
                <ModelCard model={model} partsCount={partsCount} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
