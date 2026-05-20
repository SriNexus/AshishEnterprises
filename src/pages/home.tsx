import { MainLayout } from '@/layouts/main-layout';
import { HeroSection } from '@/sections/hero';
import { AboutSection } from '@/sections/about';
import { ServicesSection } from '@/sections/services';
import { BenefitsSection } from '@/sections/benefits';
import { ProjectsSection } from '@/sections/projects';
import { TestimonialsSection } from '@/sections/testimonials';
import { BrandsSection } from '@/sections/brands';
import { FAQSection } from '@/sections/faq';
import { ContactCTASection } from '@/sections/contact-cta';
import { StatsSection } from '@/sections/stats';

/**
 * Home page — assembles all sections in order.
 */
export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <BrandsSection />
      <StatsSection />
      <AboutSection />
      <ServicesSection />
      <BenefitsSection />
      <ProjectsSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactCTASection />
    </MainLayout>
  );
}
