import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export function CartIcon() {
  const { itemCount, setIsDrawerOpen } = useCart()

  return (
    <button
      type="button"
      onClick={() => setIsDrawerOpen(true)}
      aria-label={`سلة المشتريات (${itemCount} منتجات)`}
      className="relative inline-flex items-center justify-center p-2 rounded-[10px] text-heading hover:text-accent hover:bg-neutral-light transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {itemCount > 0 && (
        <span
          className="absolute -top-1 -end-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-accent text-[11px] font-bold text-white shadow-xs motion-safe:animate-pulse motion-reduce:animate-none font-numeric tabular"
          aria-hidden="true"
        >
          {itemCount > 99 ? '+99' : itemCount}
        </span>
      )}
    </button>
  )
}
