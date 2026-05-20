import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { PROJECTS } from '@/data/constants';
import { fadeUp } from '@/animations/variants';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';

export function ProjectsSection() {
  const { t } = useTranslation();
  return (
    <Section id="projects" background="primary" padding="lg">
      <SectionHeading badge={t.projects.badge} title={t.projects.title} subtitle={t.projects.subtitle} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.slice(0, 3).map((project) => (
          <motion.div key={project.id} variants={fadeUp}>
            <div className="group relative rounded-2xl overflow-hidden border border-line bg-surface-card hover:shadow-xl hover:shadow-brand-primary/[0.04] transition-all duration-500 h-full flex flex-col">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-secondary via-brand-secondary-dark to-brand-secondary overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/15 flex items-center justify-center group-hover:bg-brand-primary/25 transition-colors">
                    <Zap className="h-8 w-8 text-brand-primary/60" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-5">
                  <span className="text-white font-semibold text-sm flex items-center gap-1.5">{t.common.viewDetails} <ArrowRight className="h-4 w-4" /></span>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge variant="primary" className="bg-white/90 text-brand-secondary-dark dark:bg-white/90 dark:text-brand-secondary-dark text-[11px]">{project.category}</Badge>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-base font-bold text-content-primary mb-2 group-hover:text-brand-primary transition-colors line-clamp-1">{project.title}</h3>
                <p className="text-sm text-content-secondary leading-relaxed mb-4 flex-1 line-clamp-2">{project.description}</p>
                {project.stats && (
                  <div className="flex gap-4 pt-4 border-t border-line">
                    {Object.entries(project.stats).map(([key, value]) => (
                      <div key={key} className="text-center flex-1">
                        <div className="text-sm font-bold text-brand-primary">{value}</div>
                        <div className="text-[10px] text-content-tertiary uppercase tracking-wider capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div variants={fadeUp} className="text-center mt-10">
        <Link to="/projects">
          <Button variant="outline" size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
            {t.projects.viewAll}
          </Button>
        </Link>
      </motion.div>
    </Section>
  );
}
