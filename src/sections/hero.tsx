import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Leaf, Phone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { STATS } from '@/data/constants';
import { useTranslation } from '@/hooks/useTranslation';

function Counter({ end, suffix = '', prefix = '', label }: {
  end: number; suffix?: string; prefix?: string; label: string;
}) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ran = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1800, 1);
          setN(Math.floor((1 - (1 - p) ** 3) * end));
          if (p < 1) requestAnimationFrame(tick); else setN(end);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="text-center lg:text-left">
      <div className="text-2xl sm:text-3xl font-bold text-white font-heading tabular-nums leading-none">
        {prefix}{n.toLocaleString()}{suffix}
      </div>
      <div className="text-[11px] text-white/30 mt-1.5 font-medium tracking-wide">{label}</div>
    </div>
  );
}

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[#060a12]" />
      <img src="/images/hero-scene.jpg" alt="" role="presentation" loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '65% 50%', maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 92%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 92%, transparent 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,10,18,0.93) 0%, rgba(6,10,18,0.88) 20%, rgba(6,10,18,0.65) 38%, rgba(6,10,18,0.25) 52%, transparent 62%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(6,10,18,0.4) 0%, transparent 30%, transparent 75%, rgba(6,10,18,0.5) 100%)' }} />
      <motion.div className="absolute top-[8%] right-[20%] w-[30vw] h-[30vw] max-w-[420px] max-h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,160,50,0.06) 0%, transparent 65%)' }}
        animate={{ opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2].map(i => (
          <div key={i} className="absolute h-px" style={{ top: `${40 + i * 9}%`, left: 0, right: 0 }}>
            <div className="h-full w-[25%]" style={{
              background: `linear-gradient(90deg, transparent, ${i === 2 ? 'rgba(16,185,129,0.1)' : `rgba(255,${155 + i * 25},0,${0.07 + i * 0.02})`}, transparent)`,
              animation: `energy-sweep ${8 + i * 2}s ease-in-out infinite ${i * 2.8}s`,
            }} />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28 w-full">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center lg:text-left">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] text-white/50 font-medium tracking-wide">{t.hero.badge}</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-heading font-extrabold tracking-[-0.03em] text-[2.5rem] leading-[1.06] sm:text-[3.1rem] lg:text-[3.4rem] xl:text-[3.8rem]">
              <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">{t.hero.heading1}</span>
              <br />
              <span className="bg-gradient-to-r from-[#FF8A00] via-amber-300 to-[#FF8A00] bg-clip-text text-transparent">{t.hero.headingAccent}</span>
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">{t.hero.heading2}</span>
            </motion.h1>

            <motion.div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-[#FF8A00] to-amber-400/40 mt-4 mx-auto lg:mx-0"
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />

            <motion.p variants={fadeUp} className="mt-6 text-[15px] text-white/40 leading-[1.75] max-w-lg mx-auto lg:mx-0">
              {t.hero.description}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link to="/contact">
                <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right" className="shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-shadow">
                  {t.hero.cta1}
                </Button>
              </Link>
              <a href="tel:+918881204444">
                <Button size="lg" variant="ghost" className="text-white/50 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]" icon={<Phone className="h-4 w-4" />}>
                  {t.hero.cta2}
                </Button>
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start">
              {[
                { I: Shield, text: t.hero.chip1 },
                { I: Leaf, text: t.hero.chip2 },
                { I: Zap, text: t.hero.chip3 },
              ].map(({ I, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5 text-[11px] text-white/28 font-medium">
                  <I className="w-3.5 h-3.5 text-brand-primary/50" />{text}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-4 pt-8 border-t border-white/[0.06]">
              {STATS.map(s => <Counter key={s.label} end={s.value} suffix={s.suffix} prefix={s.prefix} label={s.label} />)}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-surface-primary via-surface-primary/60 to-transparent z-10" />
    </section>
  );
}
