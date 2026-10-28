export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between animate-pulse rounded-[10px] border border-border bg-surface p-4"
        >
          <div>
            <div className="aspect-square w-full rounded-[8px] bg-alt" />
            <div className="mt-3 h-3 w-1/2 rounded bg-alt" />
            <div className="mt-2 h-4 w-4/5 rounded bg-alt" />
            <div className="mt-1 h-3 w-1/3 rounded bg-alt" />
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
            <div className="h-5 w-16 rounded bg-alt" />
            <div className="h-7 w-12 rounded bg-alt" />
          </div>
        </div>
      ))}
    </div>
  )
}
