import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { FAQS } from '@/data/constants';
import { fadeUp } from '@/animations/variants';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/hooks/useTranslation';

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));
  const { t } = useTranslation();

  return (
    <Section id="faq" background="secondary" padding="lg">
      <SectionHeading badge={t.faq.badge} title={t.faq.title} subtitle={t.faq.subtitle} />
      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.slice(0, 6).map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <motion.div key={faq.id} variants={fadeUp}
              className={cn('rounded-2xl border transition-all duration-300', isOpen ? 'border-brand-primary/30 bg-brand-primary/[0.03] shadow-sm' : 'border-line bg-surface-card hover:border-brand-primary/15')}>
              <button onClick={() => toggle(faq.id)} className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer">
                <span className={cn('text-[15px] font-semibold transition-colors', isOpen ? 'text-brand-primary' : 'text-content-primary')}>{faq.question}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
                  className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors', isOpen ? 'bg-brand-primary/10' : 'bg-surface-secondary')}>
                  <ChevronDown className={cn('h-4 w-4 transition-colors', isOpen ? 'text-brand-primary' : 'text-content-tertiary')} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6"><p className="text-sm text-content-secondary leading-relaxed">{faq.answer}</p></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      <motion.div variants={fadeUp} className="text-center mt-10">
        <Link to="/faq"><Button variant="outline" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">{t.faq.viewAll}</Button></Link>
      </motion.div>
    </Section>
  );
}
