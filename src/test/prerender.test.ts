import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Build-Time Prerendering & SEO Verification', () => {
  const distDir = path.resolve(process.cwd(), 'dist')

  it('home page HTML contains title, description, and Open Graph tags', () => {
    const homeHtmlPath = path.join(distDir, 'index.html')
    expect(fs.existsSync(homeHtmlPath)).toBe(true)

    const content = fs.readFileSync(homeHtmlPath, 'utf-8')
    expect(content).toContain('<title>عزاب موتو')
    expect(content).toContain('property="og:title"')
    expect(content).toContain('property="og:description"')
    expect(content).toContain('property="og:image"')
    expect(content).toContain('property="og:url"')
  })

  it('product page HTML contains Open Graph and Schema.org Product JSON-LD', () => {
    const productHtmlPath = path.join(
      distDir,
      'products',
      'front-brake-pads-apache-160-200',
      'index.html',
    )
    expect(fs.existsSync(productHtmlPath)).toBe(true)

    const content = fs.readFileSync(productHtmlPath, 'utf-8')
    expect(content).toContain('<title>تيل فرامل أمامي أصلي TVS أباتشي')
    expect(content).toContain('property="og:title"')
    expect(content).toContain('property="og:image"')
    expect(content).toContain('property="og:type" content="product"')
    expect(content).toContain('application/ld+json')
    expect(content).toContain('"@type":"Product"')
    expect(content).toContain('"sku":"AZB-BRK-001"')
  })

  it('category page HTML contains category-specific title and meta tags', () => {
    const catHtmlPath = path.join(distDir, 'catalog', 'category', 'brakes', 'index.html')
    expect(fs.existsSync(catHtmlPath)).toBe(true)

    const content = fs.readFileSync(catHtmlPath, 'utf-8')
    expect(content).toContain('<title>قطع غيار فرامل TVS')
    expect(content).toContain('property="og:title"')
  })

  it('generates valid sitemap.xml and robots.txt', () => {
    const sitemapPath = path.join(distDir, 'sitemap.xml')
    expect(fs.existsSync(sitemapPath)).toBe(true)
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8')
    expect(sitemapContent).toContain('https://azzabmoto.com/')
    expect(sitemapContent).toContain(
      'https://azzabmoto.com/products/front-brake-pads-apache-160-200',
    )

    const robotsPath = path.join(distDir, 'robots.txt')
    expect(fs.existsSync(robotsPath)).toBe(true)
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8')
    expect(robotsContent).toContain('Sitemap: https://azzabmoto.com/sitemap.xml')
  })
})
