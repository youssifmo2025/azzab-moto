import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { sanitizeSearch } from '@/shared/utils/sanitizeSearch'

interface SearchBarProps {
  onSearchSubmit?: () => void
  className?: string
}

export function SearchBar({ onSearchSubmit, className = '' }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const sanitized = sanitizeSearch(searchTerm)
    if (!sanitized) return

    navigate(`/search?q=${encodeURIComponent(sanitized)}`)
    onSearchSubmit?.()
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={`relative w-full ${className}`}>
      <label htmlFor="header-search-input" className="sr-only">
        ابحث باسم القطعة أو الموديل أو رقم القطعة
      </label>
      <div className="relative flex items-center">
        <input
          id="header-search-input"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث باسم القطعة أو الموديل أو رقم القطعة"
          className="w-full rounded-[10px] border border-border bg-base pe-10 ps-4 py-2 text-sm text-heading placeholder:text-body/60 transition focus:border-accent focus:bg-surface focus:outline-none"
        />
        <button
          type="submit"
          aria-label="تنفيذ البحث"
          className="absolute end-1.5 flex h-8 w-8 items-center justify-center rounded-[8px] text-secondary transition hover:bg-alt hover:text-accent"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
