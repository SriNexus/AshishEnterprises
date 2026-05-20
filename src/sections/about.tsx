import { motion } from 'framer-motion';
import { CheckCircle2, Award, Users, TrendingUp } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { fadeLeft, fadeRight } from '@/animations/variants';
import { useTranslation } from '@/hooks/useTranslation';

const checkpoints = [
  'UPNEDA authorized solar installer',
  'Tier-1 panels from Tata, Adani, Waaree',
  'Complete turnkey solar solutions',
  'Dedicated after-sales support team',
  'PM Surya Ghar subsidy assistance',
  'Net metering setup included',
];

export function AboutSection() {
  const { t } = useTranslation();
  const highlights = [
    { icon: Award, label: t.about.highlights[0] },
    { icon: Users, label: t.about.highlights[1] },
    { icon: TrendingUp, label: t.about.highlights[2] },
  ];

  return (
    <Section id="about" background="secondary" padding="lg">
      <SectionHeading badge={t.about.badge} title={t.about.title} subtitle={t.about.subtitle} />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-4">
        <motion.div variants={fadeLeft} className="relative">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-brand-secondary to-brand-secondary-dark">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <motion.div className="absolute inset-0 rounded-full border-2 border-brand-primary/30"
                  animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="absolute inset-4 rounded-full border-2 border-brand-primary/20"
                  animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="text-3xl">☀️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <motion.div className="absolute -bottom-6 -right-4 sm:right-8 bg-brand-primary rounded-2xl p-5 shadow-xl shadow-brand-primary/20"
            animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="text-center text-white">
              <div className="text-3xl font-bold font-heading">8+</div>
              <div className="text-xs font-medium opacity-80">Years</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeRight} className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
                <Icon className="h-4 w-4" />{label}
              </div>
            ))}
          </div>
          <p className="text-content-secondary leading-relaxed">{t.about.p1}</p>
          <p className="text-content-secondary leading-relaxed">{t.about.p2}</p>
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {checkpoints.map((point) => (
              <div key={point} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-content-primary font-medium">{point}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
