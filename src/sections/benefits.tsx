import { motion } from 'framer-motion';
import { ShieldCheck, Award, KeyRound, Headphones, BadgePercent, Timer } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { BENEFITS } from '@/data/constants';
import { fadeUp } from '@/animations/variants';
import { useTranslation } from '@/hooks/useTranslation';

const iconMap: Record<string, React.ElementType> = { ShieldCheck, Award, Key: KeyRound, Headphones, BadgePercent, Timer };

export function BenefitsSection() {
  const { t } = useTranslation();

  return (
    <Section id="benefits" background="secondary" padding="lg">
      <SectionHeading badge={t.benefits.badge} title={t.benefits.title} subtitle={t.benefits.subtitle} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {BENEFITS.map((item, idx) => {
          const Icon = iconMap[item.icon] || ShieldCheck;
          const desc = t.benefits.items[idx] || item.description;
          return (
            <motion.div key={item.title} variants={fadeUp} className="group">
              <div className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-13 h-13 rounded-2xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-all duration-300">
                    <Icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-primary/30 mb-1 tabular-nums">{String(idx + 1).padStart(2, '0')}</div>
                  <h3 className="text-base font-bold text-content-primary mb-1.5">{item.title}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
