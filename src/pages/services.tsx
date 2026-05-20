import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home,
  Building2,
  Factory,
  PlugZap,
  BatteryFull,
  Wrench,
  Zap,
  ArrowRight,
  Combine,
} from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/data/constants';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { BenefitsSection } from '@/sections/benefits';
import { FAQSection } from '@/sections/faq';

const iconMap: Record<string, React.ElementType> = {
  Home,
  Building2,
  Factory,
  PlugZap,
  BatteryFull,
  Combine,
  Wrench,
  Zap,
};

const processSteps = [
  { step: '01', title: 'Consultation', description: 'Free site visit and energy assessment' },
  { step: '02', title: 'Design', description: 'Custom system design based on your needs' },
  { step: '03', title: 'Approvals', description: 'Handle all permits and paperwork' },
  { step: '04', title: 'Installation', description: 'Professional installation by experts' },
  { step: '05', title: 'Commissioning', description: 'System testing and grid connection' },
  { step: '06', title: 'Support', description: 'Ongoing maintenance and monitoring' },
];

export default function ServicesPage() {
  const { ref: servicesRef, inView: servicesInView } = useScrollReveal();
  const { ref: processRef, inView: processInView } = useScrollReveal();

  return (
    <MainLayout>
      <PageHero
        title="Our Services"
        subtitle="Comprehensive solar and electrical solutions for homes, businesses, and industries."
        breadcrumbs={[{ label: 'Services' }]}
      />

      {/* Services Grid */}
      <Section background="primary" padding="lg">
        <SectionHeading
          badge="What We Offer"
          title="Complete Solar & Electrical Solutions"
          subtitle="From residential rooftops to MW-scale industrial plants, we deliver excellence at every scale."
        />

        <motion.div
          ref={servicesRef}
          variants={staggerContainer}
          initial="hidden"
          animate={servicesInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon] || Zap;
            return (
              <motion.div key={service.id} variants={fadeUp}>
                <Link to={`/services/${service.id}`}>
                  <Card className="group h-full cursor-pointer" padding="lg">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-all duration-300">
                      <Icon className="h-7 w-7 text-brand-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-bold font-heading text-content-primary mb-3 group-hover:text-brand-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-content-secondary leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary group-hover:gap-3 transition-all duration-300">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      {/* Our Process */}
      <Section background="secondary" padding="lg">
        <SectionHeading
          badge="Our Process"
          title="How We Work"
          subtitle="A seamless journey from consultation to commissioning, handled by experts."
        />

        <motion.div
          ref={processRef}
          variants={staggerContainer}
          initial="hidden"
          animate={processInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {processSteps.map((item) => (
            <motion.div key={item.step} variants={fadeUp}>
              <div className="relative p-6 rounded-2xl bg-surface-card border border-line hover:border-brand-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="absolute top-4 right-4 text-6xl font-bold text-brand-primary/5 group-hover:text-brand-primary/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center text-sm font-bold mb-4">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-bold text-content-primary mb-2">{item.title}</h4>
                  <p className="text-sm text-content-secondary">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Benefits */}
      <BenefitsSection />

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <Section background="gradient" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Contact us today for a free consultation and customized quote.
          </p>
          <Link to="/contact">
            <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
              Get Free Quote
            </Button>
          </Link>
        </div>
      </Section>
    </MainLayout>
  );
}
