import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Building2, Zap, Wrench, BatteryCharging, BarChart3, ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/data/constants';
import { fadeUp } from '@/animations/variants';
import { useTranslation } from '@/hooks/useTranslation';

const iconMap: Record<string, React.ElementType> = { Home, Building2, Zap, Wrench, BatteryCharging, BarChart3 };

export function ServicesSection() {
  const { t } = useTranslation();

  return (
    <Section id="services" background="primary" padding="lg">
      <SectionHeading badge={t.services.badge} title={t.services.title} subtitle={t.services.subtitle} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.slice(0, 6).map((service) => {
          const Icon = iconMap[service.icon] || Zap;
          const desc = t.services.items[service.id] || service.description;
          return (
            <motion.div key={service.id} variants={fadeUp}>
              <Link to={`/services/${service.id}`} className="block h-full">
                <div className="group h-full rounded-2xl border border-line bg-surface-card p-6 hover:shadow-xl hover:shadow-brand-primary/[0.04] hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:shadow-lg group-hover:shadow-brand-primary/25 transition-all duration-300">
                    <Icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-base font-bold text-content-primary mb-2 group-hover:text-brand-primary transition-colors">{service.title}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed mb-5">{desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary group-hover:gap-2.5 transition-all duration-300 mt-auto">
                    {t.services.learnMore} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      <motion.div variants={fadeUp} className="text-center mt-10">
        <Link to="/services">
          <Button variant="outline" size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
            {t.services.viewAll}
          </Button>
        </Link>
      </motion.div>
    </Section>
  );
}
