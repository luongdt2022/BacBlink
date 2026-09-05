import { LanguageProvider } from '@/core/contexts/LanguageContext';
import { Header } from '@/layout/Header';
import { HeroSection } from '@/features/landing/HeroSection';
import { ProblemSolutionSection } from '@/features/landing/ProblemSolutionSection';
import { ProcessSection } from '@/features/landing/ProcessSection';
import { CoreServicesSection } from '@/features/landing/CoreServicesSection';
import { SuccessStoriesSection } from '@/features/landing/SuccessStoriesSection';
import { OffersSection } from '@/features/landing/OffersSection';
import { ReferralSection } from '@/features/landing/ReferralSection';
import { CTASection } from '@/features/landing/CTASection';
import { Footer } from '@/layout/Footer';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white selection:bg-primary/20">
        <Header />
        <main>
          <HeroSection />
          <ProblemSolutionSection />
          <ProcessSection />
          <CoreServicesSection />
          <SuccessStoriesSection />
          <OffersSection />
          <ReferralSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
