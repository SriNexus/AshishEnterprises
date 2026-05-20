import { motion } from 'framer-motion';
import { Section } from '@/components/ui/section';
import { fadeUp } from '@/animations/variants';

const BRAND_NAMES = [
  'Tata Solar', 'Adani Solar', 'Luminous', 'Havells',
  'Vikram Solar', 'Waaree', 'Microtek', 'Polycab',
];

export function BrandsSection() {
  return (
    <Section background="secondary" padding="sm" className="py-10 md:py-14">
      <motion.div variants={fadeUp} className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-content-tertiary">
          Trusted Partners & Brands We Work With
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
      >
        {BRAND_NAMES.map((brand) => (
          <div
            key={brand}
            className="group px-5 py-3 rounded-xl border border-line/60 bg-surface-card/60 hover:border-brand-primary/25 hover:bg-brand-primary/[0.03] transition-all duration-300"
          >
            <span className="text-sm font-semibold text-content-tertiary group-hover:text-brand-primary transition-colors duration-300 whitespace-nowrap">
              {brand}
            </span>
          </div>
        ))}
      </motion.div>
    </Section>
  );
}
