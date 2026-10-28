/**
 * Build-time lightweight prerendering script for AZZAB MOTO
 *
 * Generates static HTML for:
 * - Home (/)
 * - Static pages (/about, /contact, /privacy, /returns, /catalog)
 * - Category pages (/catalog/category/:slug)
 * - Product pages (/products/:slug)
 *
 * Injects page-specific:
 * - <title>
 * - <meta name="description">
 * - Open Graph tags (og:title, og:description, og:url, og:image, og:type)
 * - Twitter Card tags
 * - Schema.org JSON-LD for products
 * - Static crawlable noscript/root content
 * - Generates sitemap.xml and robots.txt
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')

const SITE_URL = 'https://azzabmoto.com'
const SITE_NAME = 'عزاب موتو'
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run "vite build" first.')
  process.exit(1)
}

const templatePath = path.join(distDir, 'index.html')
if (!fs.existsSync(templatePath)) {
  console.error('Error: dist/index.html not found.')
  process.exit(1)
}

const baseTemplate = fs.readFileSync(templatePath, 'utf-8')

// Load data files
const categoriesPath = path.join(rootDir, 'src', 'data', 'categories.json')
const productsPath = path.join(rootDir, 'src', 'data', 'products.json')

const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'))

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderHtml({
  title,
  description,
  url,
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd = null,
  bodyContent = '',
}) {
  const fullUrl = `${SITE_URL}${url}`
  const escapedTitle = escapeHtml(title)
  const escapedDesc = escapeHtml(description)
  const escapedUrl = escapeHtml(fullUrl)
  const escapedImage = escapeHtml(image.startsWith('http') ? image : `${SITE_URL}${image}`)

  const metaTags = [
    `<title>${escapedTitle}</title>`,
    `<meta name="description" content="${escapedDesc}" />`,
    `<link rel="canonical" href="${escapedUrl}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${escapedTitle}" />`,
    `<meta property="og:description" content="${escapedDesc}" />`,
    `<meta property="og:url" content="${escapedUrl}" />`,
    `<meta property="og:image" content="${escapedImage}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
    `<meta name="twitter:description" content="${escapedDesc}" />`,
    `<meta name="twitter:image" content="${escapedImage}" />`,
  ]

  if (jsonLd) {
    metaTags.push(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`)
  }

  // Replace default title and description
  let html = baseTemplate
  html = html.replace(/<title>.*?<\/title>/, '')
  html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/, '')

  // Inject meta tags before </head>
  html = html.replace('</head>', `  ${metaTags.join('\n  ')}\n</head>`)

  // If fallback SSR crawlable body content is provided, inject inside #root
  if (bodyContent) {
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`)
  }

  return html
}

function writePage(routePath, html) {
  const targetDir = path.join(distDir, routePath)
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8')
}

console.log('🚀 Starting build-time prerendering for AZZAB MOTO...')

const routesToPrerender = []

// 1. Home
routesToPrerender.push({
  path: '/',
  title: 'عزاب موتو — قطع غيار TVS الأصلية | معتمد في مصر',
  description:
    'المتجر المتخصص في قطع غيار دراجات وموتوسيكلات TVS الأصلية في مصر. الدفع عند الاستلام وشحن لجميع المحافظات.',
  url: '/',
  bodyContent: `<header><h1>عزاب موتو — قطع غيار TVS الأصلية</h1><p>المتجر المتخصص في قطع غيار دراجات وموتوسيكلات TVS الأصلية في مصر</p></header>`,
})

// 2. Catalog
routesToPrerender.push({
  path: '/catalog',
  title: 'كتالوج قطع الغيار — عزاب موتو',
  description:
    'تصفح جميع قطع غيار دراجات TVS الأصلية — فلاتر، فرامل، كهرباء، مساعدين، وسيور بأفضل الأسعار في مصر.',
  url: '/catalog',
  bodyContent: `<main><h1>كتالوج قطع غيار TVS</h1><p>تصفح قطع الغيار الأصلية المعتمدة لجميع موديلات TVS</p></main>`,
})

// 3. Static Pages
const staticPages = [
  {
    path: '/about',
    title: 'من نحن — عزاب موتو',
    description: 'تعرف على متجر عزاب موتو المتخصص في قطع غيار دراجات TVS النارية في مصر.',
  },
  {
    path: '/contact',
    title: 'تواصل معنا — عزاب موتو',
    description: 'تواصل مع فريق الدعم الفني والمبيعات لمتجر عزاب موتو عبر واتساب وهاتفياً.',
  },
  {
    path: '/privacy',
    title: 'سياسة الخصوصية — عزاب موتو',
    description: 'سياسة الخصوصية وحماية بيانات الزوار والعملاء في متجر عزاب موتو لقطع غيار TVS.',
  },
  {
    path: '/returns',
    title: 'سياسة الشحن والاسترجاع — عزاب موتو',
    description:
      'سياسة الشحن والتوصيل لجميع المحافظات وشروط استبدال واسترجاع قطع غيار TVS خلال 14 يوماً.',
  },
]

for (const sp of staticPages) {
  routesToPrerender.push({
    path: sp.path,
    title: sp.title,
    description: sp.description,
    url: sp.path,
    bodyContent: `<article><h1>${escapeHtml(sp.title)}</h1><p>${escapeHtml(sp.description)}</p></article>`,
  })
}

// 4. Categories
for (const cat of categories) {
  routesToPrerender.push({
    path: `/catalog/category/${cat.slug}`,
    title: `قطع غيار ${cat.name} TVS — عزاب موتو`,
    description:
      cat.description || `قطع غيار ${cat.name} أصلية ومعتمدة لدراجات وموتوسيكلات TVS في مصر.`,
    url: `/catalog/category/${cat.slug}`,
    bodyContent: `<section><h1>قطع غيار ${escapeHtml(cat.name)} TVS</h1><p>${escapeHtml(cat.description || '')}</p></section>`,
  })
}

// 5. Products
for (const prod of products) {
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: prod.name,
    description: prod.description,
    sku: prod.sku,
    mpn: prod.partNumber || prod.sku,
    image:
      prod.images?.length > 0
        ? prod.images[0].startsWith('http')
          ? prod.images[0]
          : `${SITE_URL}${prod.images[0]}`
        : DEFAULT_IMAGE,
    brand: {
      '@type': 'Brand',
      name: 'TVS',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: prod.currency || 'EGP',
      price: prod.price,
      availability:
        prod.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  }

  routesToPrerender.push({
    path: `/products/${prod.slug}`,
    title: `${prod.name} | كود ${prod.sku} — عزاب موتو`,
    description: prod.description,
    url: `/products/${prod.slug}`,
    image: prod.images?.[0] || DEFAULT_IMAGE,
    type: 'product',
    jsonLd,
    bodyContent: `<article><h1>${escapeHtml(prod.name)}</h1><p>كود القطعة: ${escapeHtml(prod.sku)}</p><p>${escapeHtml(prod.description)}</p><p>السعر: ${prod.price} ج.م</p></article>`,
  })
}

// Execute prerendering
let count = 0
for (const route of routesToPrerender) {
  const rendered = renderHtml(route)
  if (route.path === '/') {
    fs.writeFileSync(path.join(distDir, 'index.html'), rendered, 'utf-8')
  } else {
    writePage(route.path, rendered)
  }
  count++
}

console.log(`✅ Prerendered ${count} static pages with SEO and Open Graph tags.`)

// 6. Generate sitemap.xml
const today = new Date().toISOString().split('T')[0]
const sitemapUrls = routesToPrerender.map((r) => {
  const priority = r.path === '/' ? '1.0' : r.path.startsWith('/products/') ? '0.8' : '0.6'
  const changefreq = r.path === '/' || r.path === '/catalog' ? 'daily' : 'weekly'
  return `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
})

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join('\n')}
</urlset>`

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf-8')
// Also keep in public/
fs.writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), sitemapContent, 'utf-8')
console.log('✅ Generated sitemap.xml')

// 7. Generate robots.txt
const robotsContent = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsContent, 'utf-8')
fs.writeFileSync(path.join(rootDir, 'public', 'robots.txt'), robotsContent, 'utf-8')
console.log('✅ Generated robots.txt')
