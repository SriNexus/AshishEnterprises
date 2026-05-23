import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/section';
import { STATS } from '@/data/constants';
import { fadeUp } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';

function useCounter(end: number, duration: number, inView: boolean) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    requestAnimationFrame(step);
  }, [end, duration, inView]);

  return count;
}

function StatCard({ label, value, prefix, suffix, inView }: {
  label: string; value: number; prefix?: string; suffix?: string; inView: boolean;
}) {
  const count = useCounter(value, 2200, inView);

  return (
    <motion.div variants={fadeUp}>
      <div className="text-center p-6 rounded-2xl bg-surface-card border border-line hover:border-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/[0.03] transition-all duration-300">
        <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-brand-primary mb-1 tabular-nums">
          {prefix}{count.toLocaleString()}{suffix}
        </div>
        <div className="text-sm text-content-secondary font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const { ref, inView } = useScrollReveal(0.3);

  return (
    <Section background="primary" padding="md">
      <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} inView={inView} />
        ))}
      </div>
    </Section>
  );
}
