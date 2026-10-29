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
      {/* Real motorcycle studio photography on clean light background */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-alt/60 p-3 sm:p-4 flex items-center justify-center">
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
            className="h-full w-full object-contain img-hover-zoom transition duration-500 group-hover:scale-105"
          />
        )}

        {/* Small model badge */}
        <span className="absolute bottom-2 start-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-semibold text-secondary shadow-2xs backdrop-blur-xs">
          <Bike className="h-3 w-3 text-accent" aria-hidden="true" />
          <span>{(model.nameAr || model.name).split(' ')[0]}</span>
        </span>
      </div>

      <div className="p-3.5 sm:p-4">
        <h3 className="font-heading text-sm font-bold text-heading transition group-hover:text-accent">
          {model.name}
        </h3>
        <p className="mt-1 text-xs text-body font-numeric tabular">
          {partsCount > 0 ? `${partsCount} قطعة غيار متوفرة` : 'قطع غيار أصلية'}
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
            className="hidden items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-hover sm:inline-flex"
          >
            <span>كل الموديلات</span>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {models.map((model) => {
            const partsCount = products.filter((p) =>
              p.compatibility.some((c) => c.modelId === model.id),
            ).length

            return <ModelCard key={model.id} model={model} partsCount={partsCount} />
          })}
        </div>
      </div>
    </section>
  )
}
