/**
 * Feature flags for AZZAB MOTO.
 * Source of truth: AGENTS.md and docs/proposal.pdf
 *
 * IMPORTANT — Security boundary notice:
 * These flags are compile-time convenience flags. They dictate UI visibility and routing
 * in the Starter package, but are NOT a security boundary. True authorization and security
 * must live on a backend when Business/Premium tiers are implemented.
 */
export const features = {
  // ── Starter (ON) ──────────────────────────────────────────────────────────
  /** Product catalog listing */
  catalog: true,
  /** Single product detail view */
  productDetails: true,
  /** Product search by name, SKU, or part number */
  search: true,
  /** Category browsing */
  categories: true,
  /** Direct WhatsApp order flow with prefilled message */
  whatsappOrder: true,
  /** Informational static pages (about, contact, policy) */
  staticPages: true,
  /**
   * Vehicle selector (model / year / category) on Home and Catalog.
   * Enabled in Starter on static JSON; recorded in ROADMAP.md for client confirmation.
   */
  vehicleFilter: true,

  // ── Business (OFF) ────────────────────────────────────────────────────────
  /** User accounts, authentication, and profiles */
  accounts: false,
  /** Shopping cart & persistent state */
  cart: false,
  /** Cash-on-delivery (COD) multi-step checkout */
  checkout: false,
  /** Live order tracking by order ID */
  orderTracking: false,
  /** Dedicated model & production year faceted filters */
  modelYearFilter: false,
  /** Advanced catalog filtering (price range, manufacturer, etc.) */
  advancedFilters: false,
  /** Real-time stock counts via inventory API */
  inventory: false,
  /** Discount coupons and promotional codes */
  coupons: false,
  /** Governorate-based shipping calculation zones */
  shippingZones: false,
  /** Basic merchant sales and visitors reporting */
  basicReports: false,

  // ── Premium (OFF) ─────────────────────────────────────────────────────────
  /** Saved user motorcycle profiles ("My Garage") */
  garage: false,
  /** OEM part number and barcode scanning search */
  partNumberSearch: false,
  /** Wishlist / saved favorite products */
  favorites: false,
  /** 1-click reorder from purchase history */
  reorder: false,
  /** AI / rule-based product recommendations */
  recommendations: false,
  /** Scheduled maintenance packages & bundles */
  maintenanceBundles: false,
  /** Manual InstaPay verification flow */
  instaPayManual: false,
  /** Multi-user role-based access control (RBAC) */
  roles: false,
  /** Data export to Microsoft Excel */
  excelExport: false,
  /** Comprehensive analytics integration */
  analytics: false,
} as const

export type FeatureFlags = typeof features
export type FeatureKey = keyof FeatureFlags
