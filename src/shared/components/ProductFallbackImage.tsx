import type { FC } from 'react'

interface ProductFallbackImageProps {
  categoryId?: string
  productName?: string
  isMotorcycle?: boolean
  className?: string
}

/**
 * Premium category-specific mechanical vector fallback.
 * Renders authentic, crisp engineering illustrations for each TVS spare-part category
 * and motorcycle models without any network dependency.
 */
export const ProductFallbackImage: FC<ProductFallbackImageProps> = ({
  categoryId,
  productName,
  isMotorcycle = false,
  className = 'h-full w-full',
}) => {
  // If explicitly a motorcycle or model
  if (isMotorcycle) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 160 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-auto text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Motorcycle Silhouette & Frame */}
          {/* Wheels */}
          <circle cx="32" cy="72" r="22" stroke="currentColor" strokeWidth="4" />
          <circle cx="32" cy="72" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx="32" cy="72" r="4" fill="currentColor" />

          <circle cx="128" cy="72" r="22" stroke="currentColor" strokeWidth="4" />
          <circle cx="128" cy="72" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx="128" cy="72" r="4" fill="currentColor" />

          {/* Engine & Crankcase Block */}
          <rect x="68" y="58" width="28" height="20" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
          <circle cx="82" cy="68" r="5" stroke="currentColor" strokeWidth="1.5" />

          {/* Exhaust pipe */}
          <path d="M84 76 Q100 80 126 74" stroke="#FF8200" strokeWidth="2.5" strokeLinecap="round" />

          {/* Chassis / Frame Tubes */}
          <path d="M32 72 L62 48 L96 48 L128 72" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <path d="M62 48 L72 74 L96 48" stroke="currentColor" strokeWidth="2.5" />
          <path d="M96 48 L108 30 L118 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

          {/* Fuel Tank & Seat */}
          <path
            d="M60 46 C60 40 70 34 84 34 C94 34 100 38 104 46 Z"
            fill="#FF8200"
            fillOpacity="0.85"
          />
          <path
            d="M52 46 C56 42 66 42 74 46 L68 50 L50 50 Z"
            fill="currentColor"
            fillOpacity="0.4"
          />

          {/* Handlebar & Headlight */}
          <path d="M106 32 L114 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M112 36 L120 38" stroke="#FF8200" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="mt-2 text-[11px] font-bold tracking-tight text-secondary/80">
          دراجة TVS نارية معتمدة
        </span>
      </div>
    )
  }

  // Brakes (Brake pads & brake discs)
  if (categoryId === 'cat-brakes') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Ventilated Brake Disc */}
          <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="3" />
          <circle cx="60" cy="60" r="42" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="60" cy="60" r="26" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.05" />
          <circle cx="60" cy="60" r="12" stroke="currentColor" strokeWidth="2" />

          {/* Rotor Mounting Holes */}
          <circle cx="60" cy="42" r="3" fill="#FF8200" />
          <circle cx="60" cy="78" r="3" fill="#FF8200" />
          <circle cx="42" cy="60" r="3" fill="#FF8200" />
          <circle cx="78" cy="60" r="3" fill="#FF8200" />

          {/* Ventilation Slits */}
          <path d="M60 16 L60 22 M78 20 L74 25 M94 36 L88 39 M100 58 L94 58 M92 78 L87 74 M78 94 L75 88 M60 100 L60 94 M42 94 L45 88 M26 80 L31 76 M18 60 L24 60 M24 40 L29 43 M38 24 L42 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

          {/* Brake Caliper Overlay */}
          <path
            d="M72 20 C88 28 98 44 98 62 L84 62 C84 48 76 36 64 30 Z"
            fill="#FF8200"
            fillOpacity="0.85"
            stroke="#B45300"
            strokeWidth="1.5"
          />
          <circle cx="86" cy="38" r="2.5" fill="#FFFFFF" />
          <circle cx="92" cy="50" r="2.5" fill="#FFFFFF" />
        </svg>
        <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
          نظام فرامل TVS أصلي
        </span>
      </div>
    )
  }

  // Filters (Oil, Air, Fuel)
  if (categoryId === 'cat-filters') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Oil & Air Filter Cartridge */}
          {/* Filter Body Canister */}
          <rect x="36" y="24" width="48" height="72" rx="6" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.04" />
          {/* Top Sealing Gasket */}
          <rect x="32" y="20" width="56" height="8" rx="3" fill="#FF8200" stroke="#B45300" strokeWidth="1.5" />
          <ellipse cx="60" cy="24" rx="14" ry="3" fill="#FFFFFF" stroke="#B45300" strokeWidth="1" />

          {/* Pleated Filter Paper Texture */}
          <line x1="44" y1="36" x2="44" y2="88" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="52" y1="36" x2="52" y2="88" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="60" y1="36" x2="60" y2="88" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="68" y1="36" x2="68" y2="88" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="76" y1="36" x2="76" y2="88" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Center Perforated Core Tube */}
          <rect x="52" y="38" width="16" height="48" rx="2" stroke="#FF8200" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Bottom Flange */}
          <path d="M36 90 L84 90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
          فلتر تنقية TVS أصلي
        </span>
      </div>
    )
  }

  // Electrical & Ignition (Spark plug, Stator coil, CDI)
  if (categoryId === 'cat-electrical') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Spark Plug Technical Drawing */}
          {/* Terminal Nut */}
          <rect x="56" y="16" width="8" height="10" rx="1.5" fill="#FF8200" />

          {/* Ceramic Insulator with Ribs */}
          <rect x="52" y="26" width="16" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="#FFFFFF" />
          <line x1="50" y1="32" x2="70" y2="32" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="38" x2="70" y2="38" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="44" x2="70" y2="44" stroke="currentColor" strokeWidth="1.5" />

          {/* Hex Nut Collar */}
          <path d="M46 50 L74 50 L70 60 L50 60 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />

          {/* Metal Shell Thread */}
          <rect x="52" y="60" width="16" height="24" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
          <line x1="52" y1="66" x2="68" y2="66" stroke="currentColor" strokeWidth="1.5" />
          <line x1="52" y1="72" x2="68" y2="72" stroke="currentColor" strokeWidth="1.5" />
          <line x1="52" y1="78" x2="68" y2="78" stroke="currentColor" strokeWidth="1.5" />

          {/* Central Electrode & Ground Electrode */}
          <line x1="60" y1="84" x2="60" y2="94" stroke="#FF8200" strokeWidth="2.5" />
          <path d="M66 84 L66 98 L58 98" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

          {/* Electric Spark Accent */}
          <path d="M61 90 L64 93 L62 96" stroke="#FF8200" strokeWidth="1.5" />
        </svg>
        <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
          كهرباء وإشعال TVS
        </span>
      </div>
    )
  }

  // Batteries
  if (categoryId === 'cat-batteries') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* 12V Battery Casing */}
          {/* Terminals */}
          <rect x="36" y="24" width="12" height="10" rx="2" fill="#3E8E5E" />
          <rect x="72" y="24" width="12" height="10" rx="2" fill="#C0392B" />
          <text x="42" y="21" fill="#3E8E5E" fontSize="12" fontWeight="bold" textAnchor="middle">-</text>
          <text x="78" y="21" fill="#C0392B" fontSize="12" fontWeight="bold" textAnchor="middle">+</text>

          {/* Main Case */}
          <rect x="28" y="32" width="64" height="62" rx="5" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          {/* Top Lid */}
          <rect x="26" y="32" width="68" height="10" rx="2" fill="currentColor" fillOpacity="0.25" />

          {/* Brand/Voltage Badge */}
          <rect x="38" y="52" width="44" height="22" rx="3" fill="#FF8200" fillOpacity="0.9" />
          <text x="60" y="67" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">
            12V TVS
          </text>

          {/* Level indicators */}
          <line x1="34" y1="84" x2="86" y2="84" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
        <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
          بطارية TVS أصلية
        </span>
      </div>
    )
  }

  // Tires
  if (categoryId === 'cat-tires') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Motorcycle Tire with Deep Tread Patterns */}
          <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="6" />
          <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="24" stroke="#FF8200" strokeWidth="3" fill="currentColor" fillOpacity="0.05" />
          <circle cx="60" cy="60" r="8" fill="currentColor" />

          {/* Directional Tread Grooves */}
          <path d="M60 14 L55 20 M60 14 L65 20" stroke="#FF8200" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 38 L90 42 M96 38 L94 46" stroke="#FF8200" strokeWidth="2" strokeLinecap="round" />
          <path d="M106 60 L98 60" stroke="#FF8200" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 82 L90 78 M96 82 L94 74" stroke="#FF8200" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 106 L55 100 M60 106 L65 100" stroke="#FF8200" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 82 L30 78 M24 82 L26 74" stroke="#FF8200" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 60 L22 60" stroke="#FF8200" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 38 L30 42 M24 38 L26 46" stroke="#FF8200" strokeWidth="2" strokeLinecap="round" />

          {/* Spokes */}
          <line x1="60" y1="36" x2="60" y2="52" stroke="currentColor" strokeWidth="2" />
          <line x1="60" y1="68" x2="60" y2="84" stroke="currentColor" strokeWidth="2" />
          <line x1="36" y1="60" x2="52" y2="60" stroke="currentColor" strokeWidth="2" />
          <line x1="68" y1="60" x2="84" y2="60" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
          إطار TVS Eurogrip أصلي
        </span>
      </div>
    )
  }

  // Oils & Lubricants
  if (categoryId === 'cat-oils') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Oil Bottle Profile */}
          <rect x="50" y="16" width="20" height="10" rx="2" fill="#FF8200" />
          <path
            d="M52 26 L42 38 L40 94 C40 98 44 102 48 102 L72 102 C76 102 80 98 80 94 L78 38 L68 26 Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="currentColor"
            fillOpacity="0.04"
          />
          {/* Handle */}
          <path d="M78 46 C86 52 86 78 78 84" stroke="currentColor" strokeWidth="2.5" fill="none" />

          {/* Viewing Level Gauge */}
          <line x1="45" y1="50" x2="45" y2="92" stroke="#FF8200" strokeWidth="2" />

          {/* Droplet & TRU4 Emblem */}
          <path
            d="M60 52 C54 62 50 68 50 74 C50 80 54 84 60 84 C66 84 70 80 70 74 C70 68 66 62 60 52 Z"
            fill="#FF8200"
            fillOpacity="0.85"
          />
          <text x="60" y="77" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
            4T
          </text>
        </svg>
        <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
          زيت TVS TRU4 معتمد
        </span>
      </div>
    )
  }

  // Engine Components (Piston, Gaskets, Cam Chain, Clutch)
  if (categoryId === 'cat-engine') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Piston & Pin Assembly */}
          {/* Piston Crown & Skirt */}
          <rect x="36" y="24" width="48" height="42" rx="4" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.06" />

          {/* Compression Ring Grooves */}
          <line x1="36" y1="32" x2="84" y2="32" stroke="#FF8200" strokeWidth="2" />
          <line x1="36" y1="38" x2="84" y2="38" stroke="#FF8200" strokeWidth="2" />
          <line x1="36" y1="44" x2="84" y2="44" stroke="currentColor" strokeWidth="1.5" />

          {/* Gudgeon Wrist Pin */}
          <circle cx="60" cy="52" r="7" stroke="currentColor" strokeWidth="2.5" fill="#FFFFFF" />
          <circle cx="60" cy="52" r="3" fill="#FF8200" />

          {/* Connecting Rod */}
          <path d="M56 59 L54 86 L50 88 C48 94 56 100 60 100 C64 100 72 94 70 88 L66 86 L64 59" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
          <circle cx="60" cy="92" r="4" stroke="currentColor" strokeWidth="2" fill="#FFFFFF" />
        </svg>
        <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
          مكونات محرك TVS الأصلية
        </span>
      </div>
    )
  }

  // Accessories & Protection (Crash guards, Phone mounts)
  if (categoryId === 'cat-accessories') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Protective Shield & Heavy Duty Tubular Guard */}
          <path
            d="M60 20 L88 32 C88 64 74 88 60 98 C46 88 32 64 32 32 Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="currentColor"
            fillOpacity="0.05"
          />
          {/* Inner Accent Crest */}
          <path
            d="M60 30 L80 39 C80 62 69 80 60 88 C51 80 40 62 40 39 Z"
            stroke="#FF8200"
            strokeWidth="2"
            fill="#FF8200"
            fillOpacity="0.1"
          />
          {/* Checkmark of Authenticity */}
          <path d="M52 56 L58 62 L70 48" stroke="#FF8200" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
          إكسسوارات وحماية TVS
        </span>
      </div>
    )
  }

  // Generic TVS Spare Part fallback
  return (
    <div
      className={`flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-20 w-20 text-secondary/40 transition-transform duration-300 group-hover:scale-105"
      >
        <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 4" />
        <rect x="42" y="42" width="36" height="36" rx="6" fill="#FF8200" fillOpacity="0.85" />
        <circle cx="60" cy="60" r="8" fill="#FFFFFF" />
        <path d="M42 60 L78 60 M60 42 L60 78" stroke="#B45300" strokeWidth="2" />
      </svg>
      <span className="mt-1.5 text-[11px] font-semibold text-secondary/80">
        {productName || 'قطع غيار TVS أصلية'}
      </span>
    </div>
  )
}

