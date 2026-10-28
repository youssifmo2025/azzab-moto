# عزاب موتو | AZZAB MOTO

> المتجر المتخصص في قطع غيار دراجات وموتوسيكلات TVS الأصلية في مصر.  
> واجهة المتجر الأولي (Starter Store Edition) — عرض الكتالوج، فحص التوافق الميكانيكي، والطلب المباشر عبر واتساب.

---

## 🚀 نبذة سريعة (Quick Start)

### المتطلبات الأساسية

- **Node.js**: إصدار `20.0.0` أو أحدث
- **npm**: إصدار `10.0.0` أو أحدث

### التثبيت والتشغيل المحلي

```bash
# تثبيت الاعتماديات
npm install

# تشغيل خادم التطوير المحلي
npm run dev

# تشغيل الفحص البرمجي الكامل (Typecheck)
npm run typecheck

# تشغيل الفحوصات الأمنية وقواعد الكود (Lint)
npm run lint

# تشغيل كافة اختبارات الوحدة والتكامل (Vitest)
npm run test

# بناء النسخة الإنتاجية مع التوليد المسبق (Build & Prerender)
npm run build
```

---

## 🛠 المعمارية والتقنيات (Tech Stack)

- **UI Framework**: React 19 + TypeScript (Strict Mode)
- **Bundler & Build**: Vite + React Compiler
- **Styling**: Tailwind CSS v4 + Design Tokens (`src/styles/tokens.css`)
- **Typography**: Self-hosted Arabic Fonts (`@fontsource/tajawal`, `@fontsource/ibm-plex-sans-arabic`, `@fontsource/ibm-plex-mono`)
- **Routing**: React Router DOM (Lazy-loaded routes with error boundary and accessible focus management)
- **Validation**: Zod (Single source of truth for runtime data parsing)
- **State & Storage**: Resilient typed LocalStorage wrapper with Zod validation
- **Testing**: Vitest + React Testing Library + jest-dom (122 tests, 100% pass)
- **SEO & PWA**: Build-time static prerendering, Open Graph, Schema.org Product JSON-LD, Service Worker (Cache-First assets / Network-First data), and webmanifest

---

## 📁 هيكلية المشروع (Project Structure)

```
src/
├── app/                  # إعدادات المتجر، المسارات، القالب الرئيسي، وقواطع الأخطاء
│   ├── config/           # siteConfig (البيانات والروابط) و features (أعلام الميزات)
│   ├── layouts/          # الهيدر، الفوتر، القائمة الجانبية، وإدارة تركيز الشاشة
│   └── router/           # مسارات التطبيق المعلقة (Lazy Router)
├── assets/               # شعار المتجر والصور التوضيحية الرئيسية
├── data/                 # ملفات البيانات الثابتة (products.json, models.json, categories.json)
├── features/             # وحدات المتجر الوظيفية المستقلة
│   ├── catalog/          # الكتالوج، الفلاتر الجانبية والسفلية، كروت المنتجات
│   ├── product/          # صفحة تفاصيل القطعة، جدول التوافق، معرض الصور
│   ├── vehicle-selector/ # منتقي الموتوسيكل (الموديل، السنة، القسم)
│   ├── search/           # البحث المتقدم بالاسم، الكود، والرقم الهندسي
│   └── static-pages/     # أقسام الرئيسية، من نحن، الشحن والاسترجاع، والخصوصية
├── services/             # نمط المستودعات (Repository Pattern) لفصل البيانات عن الواجهة
└── shared/               # الأدوات المشتركة، معالجة النصوص العربية، وبناء روابط واتساب
```

---

## 📄 التوثيق المعماري والإرشادي (Documentation Index)

- [دليل التسليم واستفسارات العميل (HANDOVER.md)](docs/HANDOVER.md)
- [المعمارية ومخططات التدفق (ARCHITECTURE.md)](docs/ARCHITECTURE.md)
- [الهندسة الأمنية ونموذج التهديدات (SECURITY.md)](docs/SECURITY.md)
- [نظام التصميم والألوان والخطوط (DESIGN_SYSTEM.md)](docs/DESIGN_SYSTEM.md)
- [خارطة الطريق وترقيات الباقات (ROADMAP.md)](docs/ROADMAP.md)
- [كيفية إضافة ميزة جديدة (ADDING_A_FEATURE.md)](docs/ADDING_A_FEATURE.md)
- [سجل القرارات المعمارية (ADR Index)](docs/ADR/)
