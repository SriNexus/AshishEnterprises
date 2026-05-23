import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Building2,
  Factory,
  PlugZap,
  BatteryFull,
  Wrench,
  Zap,
  Combine,
  CheckCircle2,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SERVICES, SITE_CONFIG } from '@/data/constants';
import { fadeUp, fadeLeft, fadeRight, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { FAQSection } from '@/sections/faq';
import { TestimonialsSection } from '@/sections/testimonials';

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

const serviceDetails: Record<string, { benefits: string[]; process: string[]; specs?: Record<string, string> }> = {
  'residential-solar': {
    benefits: [
      'Reduce electricity bills by 50-90%',
      'Government subsidies up to 40%',
      '25-year panel warranty',
      'Increase property value',
      'Low maintenance',
      'Net metering benefits',
    ],
    process: [
      'Free site survey & shade analysis',
      'Customized system design',
      'Government subsidy application',
      'Professional installation (2-3 days)',
      'DISCOM approval & net metering',
      'System commissioning & handover',
    ],
    specs: {
      'Typical Size': '3-10 kW',
      'Space Required': '100-350 sq.ft',
      'Installation Time': '2-3 days',
      'Payback Period': '4-5 years',
    },
  },
  'commercial-solar': {
    benefits: [
      'Reduce operational costs by 40-70%',
      'Accelerated depreciation benefits',
      'Carbon footprint reduction',
      'Energy independence',
      'Professional maintenance',
      'Scalable solutions',
    ],
    process: [
      'Energy audit & load analysis',
      'Financial feasibility study',
      'Engineering design',
      'Structural assessment',
      'Installation & commissioning',
      'Performance monitoring setup',
    ],
    specs: {
      'Typical Size': '10-500 kW',
      'ROI': '3-4 years',
      'Savings': '40-70%',
      'Lifespan': '25+ years',
    },
  },
  'industrial-solar': {
    benefits: [
      'MW-scale installations',
      'Open access benefits',
      'Power purchase agreements',
      'Captive power generation',
      'Grid stability',
      'ESG compliance',
    ],
    process: [
      'Detailed feasibility study',
      'Land/roof assessment',
      'Grid connectivity planning',
      'EPC execution',
      'Testing & commissioning',
      'O&M handover',
    ],
    specs: {
      'Typical Size': '1-50 MW',
      'Land Required': '4-5 acres/MW',
      'Installation Time': '3-6 months',
      'PPA Duration': '20-25 years',
    },
  },
  'on-grid-systems': {
    benefits: [
      'Zero electricity bills possible',
      'Net metering credits',
      'No battery cost',
      'Lower initial investment',
      'Maximum ROI',
      'Grid as virtual battery',
    ],
    process: [
      'Load analysis',
      'System sizing',
      'Net metering application',
      'Installation',
      'DISCOM inspection',
      'Meter replacement',
    ],
    specs: {
      'Best For': 'Grid-connected areas',
      'Battery': 'Not required',
      'Net Metering': 'Included',
      'Maintenance': 'Minimal',
    },
  },
  'off-grid-systems': {
    benefits: [
      'Complete energy independence',
      '24/7 power availability',
      'No electricity bills',
      'Ideal for remote areas',
      'Reliable backup',
      'Expandable capacity',
    ],
    process: [
      'Power requirement analysis',
      'Battery sizing',
      'System design',
      'Installation',
      'Testing & balancing',
      'User training',
    ],
    specs: {
      'Best For': 'Remote/rural areas',
      'Battery': 'Required',
      'Backup Hours': '8-12 hours',
      'Maintenance': 'Regular',
    },
  },
  'hybrid-solar': {
    benefits: [
      'Best of both worlds',
      'Uninterrupted power supply',
      'Smart energy management',
      'Peak shaving',
      'Future-proof investment',
      'Flexible operation modes',
    ],
    process: [
      'Comprehensive load study',
      'Hybrid inverter selection',
      'Battery bank sizing',
      'System integration',
      'Grid synchronization',
      'Smart monitoring setup',
    ],
    specs: {
      'Components': 'Panels + Battery + Grid',
      'Backup': '4-12 hours',
      'Smart Features': 'Yes',
      'Remote Monitoring': 'Included',
    },
  },
  'solar-maintenance': {
    benefits: [
      'Maximize system efficiency',
      'Prevent unexpected failures',
      'Extend equipment life',
      'Performance guarantee',
      '24/7 monitoring',
      'Priority support',
    ],
    process: [
      'Panel cleaning',
      'Electrical inspection',
      'Inverter servicing',
      'Performance analysis',
      'Report generation',
      'Recommendation updates',
    ],
    specs: {
      'Frequency': 'Quarterly/Monthly',
      'Response Time': '<24 hours',
      'Coverage': 'Complete system',
      'Monitoring': 'Real-time',
    },
  },
  'electrical-services': {
    benefits: [
      'Licensed electricians',
      'Safety compliant',
      'Quality materials',
      'Warranty on work',
      'Emergency service',
      'Competitive pricing',
    ],
    process: [
      'Site inspection',
      'Requirement analysis',
      'Quote preparation',
      'Material procurement',
      'Execution',
      'Testing & handover',
    ],
    specs: {
      'Services': 'Wiring, Panels, Repairs',
      'Compliance': 'IS Standards',
      'Warranty': '1-5 years',
      'Emergency': '24/7 available',
    },
  },
};

export default function ServiceDetailPage() {
  const phone = SITE_CONFIG.phone;
  const { slug } = useParams<{ slug: string }>();
  const service = SERVICES.find((s) => s.id === slug);
  const details = slug ? serviceDetails[slug] : null;

  if (!service || !details) {
    return <Navigate to="/services" replace />;
  }

  const Icon = iconMap[service.icon] || Zap;
  const otherServices = SERVICES.filter((s) => s.id !== slug).slice(0, 3);

  const { ref: benefitsRef, inView: benefitsInView } = useScrollReveal();
  const { ref: processRef, inView: processInView } = useScrollReveal();

  return (
    <MainLayout>
      <PageHero
        title={service.title}
        subtitle={service.description}
        breadcrumbs={[{ label: 'Services', href: '/services' }, { label: service.title }]}
      />

      {/* Service Overview */}
      <Section background="primary" padding="lg">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-brand-secondary to-brand-secondary-dark">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <Icon className="w-16 h-16 text-brand-primary" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 bg-brand-primary/10 text-brand-primary">
                {service.title}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-content-primary mb-4">
                Professional {service.title} Solutions
              </h2>
              <p className="text-content-secondary leading-relaxed">{service.description}</p>
            </div>

            {/* Features */}
            {service.features && (
              <div className="grid grid-cols-2 gap-3">
                {service.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0" />
                    <span className="text-sm text-content-primary">{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Specs */}
            {details.specs && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-secondary border border-line">
                {Object.entries(details.specs).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-xs text-content-tertiary">{key}</div>
                    <div className="text-sm font-semibold text-content-primary">{value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                  Get Quote
                </Button>
              </Link>
              <a href={`tel:${phone}`}>
                <Button size="lg" variant="outline" icon={<Phone className="h-5 w-5" />}>
                  Call Now
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Benefits */}
      <Section background="secondary" padding="lg">
        <SectionHeading
          badge="Benefits"
          title={`Why Choose ${service.title}?`}
          subtitle="Discover the advantages of our professional solutions."
        />

        <motion.div
          ref={benefitsRef}
          variants={staggerContainer}
          initial="hidden"
          animate={benefitsInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {details.benefits.map((benefit, idx) => (
            <motion.div key={idx} variants={fadeUp}>
              <Card className="h-full" padding="md">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                  </div>
                  <p className="text-content-primary font-medium">{benefit}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Process */}
      <Section background="primary" padding="lg">
        <SectionHeading
          badge="Our Process"
          title="How We Deliver"
          subtitle="A streamlined process for hassle-free implementation."
        />

        <motion.div
          ref={processRef}
          variants={staggerContainer}
          initial="hidden"
          animate={processInView ? 'visible' : 'hidden'}
          className="relative"
        >
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-line -translate-y-1/2" />
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {details.process.map((step, idx) => (
              <motion.div key={idx} variants={fadeUp} className="relative">
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-brand-primary text-white flex items-center justify-center text-lg font-bold mb-3 relative z-10">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-content-primary font-medium">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FAQSection />

      {/* Other Services */}
      <Section background="secondary" padding="lg">
        <SectionHeading
          badge="Explore More"
          title="Other Services"
          subtitle="Discover our complete range of solar and electrical solutions."
        />

        <div className="grid sm:grid-cols-3 gap-6">
          {otherServices.map((s) => {
            const SIcon = iconMap[s.icon] || Zap;
            return (
              <Link key={s.id} to={`/services/${s.id}`}>
                <Card className="h-full group" padding="md">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-all">
                    <SIcon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-bold text-content-primary group-hover:text-brand-primary transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-sm text-content-secondary mt-2">{s.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* CTA */}
      <Section background="gradient" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
            Ready for {service.title}?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Get a free consultation and customized quote for your project.
          </p>
          <Link to="/contact">
            <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
              Request Free Quote
            </Button>
          </Link>
        </div>
      </Section>
    </MainLayout>
  );
}
