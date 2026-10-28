import { Helmet } from 'react-helmet-async'
import { siteConfig } from '@/app/config/site'
import { HeroSection } from '../components/HeroSection'
import { VehicleSelectorSection } from '@/features/vehicle-selector/components/VehicleSelectorSection'
import { ModelsSection } from '../components/ModelsSection'
import { CategoriesSection } from '../components/CategoriesSection'
import { BestSellersSection } from '../components/BestSellersSection'
import { WorkshopDiscountSection } from '../components/WorkshopDiscountSection'
import { SendPhotoSection } from '../components/SendPhotoSection'
import { WhyUsSection } from '../components/WhyUsSection'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>{`${siteConfig.name} — ${siteConfig.tagline}`}</title>
        <meta name="description" content={siteConfig.description} />
      </Helmet>

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Vehicle Selector Section */}
      <VehicleSelectorSection />

      {/* 3. TVS Models Grid */}
      <ModelsSection />

      {/* 4. Circular Categories */}
      <CategoriesSection />

      {/* 5. Best Sellers */}
      <BestSellersSection />

      {/* 6. Workshop Discount Strip */}
      <WorkshopDiscountSection />

      {/* 7. Send Photo Section */}
      <SendPhotoSection />

      {/* 8. Why AZZAB MOTO (4 points) */}
      <WhyUsSection />
    </>
  )
}
