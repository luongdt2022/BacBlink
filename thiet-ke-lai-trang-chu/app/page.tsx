import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { ListingsSection } from "@/components/home/listings-section"
import { ProcessSection } from "@/components/home/process-section"
import { CtaSection } from "@/components/home/cta-section"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ListingsSection />
        <ProcessSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
