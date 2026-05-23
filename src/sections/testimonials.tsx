import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { TESTIMONIALS } from '@/data/constants';
import { fadeUp } from '@/animations/variants';
import { useTranslation } from '@/hooks/useTranslation';

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const total = TESTIMONIALS.length;
  const { t } = useTranslation();
  const next = useCallback(() => setActive((c) => (c === total - 1 ? 0 : c + 1)), [total]);
  const prev = useCallback(() => setActive((c) => (c === 0 ? total - 1 : c - 1)), [total]);
  useEffect(() => { const id = setInterval(next, 6000); return () => clearInterval(id); }, [next]);
  const item = TESTIMONIALS[active];

  return (
    <Section id="testimonials" background="secondary" padding="lg">
      <SectionHeading badge={t.testimonials.badge} title={t.testimonials.title} subtitle={t.testimonials.subtitle} />
      <motion.div variants={fadeUp} className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-line bg-surface-card overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
          <Quote className="absolute top-8 right-8 h-28 w-28 text-brand-primary/[0.04]" />
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-content-tertiary/20'}`} />
                  ))}
                </div>
                <blockquote className="text-lg md:text-xl lg:text-2xl text-content-primary leading-relaxed font-medium mb-10">"{item.content}"</blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-primary/20">{item.name.charAt(0)}</div>
                  <div>
                    <div className="font-bold text-content-primary text-lg">{item.name}</div>
                    <div className="text-sm text-content-secondary">{item.role}, {item.company}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-line">
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all duration-400 cursor-pointer ${i === active ? 'bg-brand-primary w-8' : 'bg-content-tertiary/20 w-2 hover:bg-content-tertiary/40'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="w-11 h-11 rounded-xl border border-line flex items-center justify-center text-content-secondary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 cursor-pointer"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={next} className="w-11 h-11 rounded-xl border border-line flex items-center justify-center text-content-secondary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 cursor-pointer"><ChevronRight className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
