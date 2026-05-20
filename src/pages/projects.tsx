import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, X, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PROJECTS } from '@/data/constants';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { StatsSection } from '@/sections/stats';
import { TestimonialsSection } from '@/sections/testimonials';

const categories = ['All', 'Commercial', 'Residential', 'Industrial', 'Healthcare', 'Government', 'Hospitality'];

export default function ProjectsPage() {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
  const { ref, inView } = useScrollReveal();

  const filteredProjects = filter === 'All' 
    ? PROJECTS 
    : PROJECTS.filter((p) => p.category === filter);

  return (
    <MainLayout>
      <PageHero
        title="Our Projects"
        subtitle="Explore our portfolio of successful solar installations across India."
        breadcrumbs={[{ label: 'Projects' }]}
      />

      {/* Stats */}
      <StatsSection />

      {/* Projects Grid */}
      <Section background="primary" padding="lg">
        <SectionHeading
          badge="Portfolio"
          title="Projects That Inspire"
          subtitle="From residential rooftops to MW-scale plants, explore our diverse portfolio."
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                filter === cat
                  ? 'bg-brand-primary text-white'
                  : 'bg-surface-secondary border border-line text-content-secondary hover:border-brand-primary/30 hover:text-brand-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={fadeUp}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  onClick={() => setSelectedProject(project)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-line bg-surface-card hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-secondary to-brand-secondary-dark overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Zap className="w-10 h-10 text-brand-primary" />
                      </motion.div>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/80 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="primary" className="bg-white/90 text-brand-secondary">
                        {project.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-content-primary group-hover:text-brand-primary transition-colors mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-content-secondary line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    {/* Stats */}
                    {project.stats && (
                      <div className="flex gap-4 pt-4 border-t border-line">
                        {Object.entries(project.stats).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-center flex-1">
                            <div className="text-sm font-bold text-brand-primary">{value}</div>
                            <div className="text-[10px] text-content-tertiary uppercase tracking-wider capitalize">
                              {key}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA */}
      <Section background="gradient" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
            Want to Be Our Next Success Story?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Let's discuss your solar project requirements.
          </p>
          <Link to="/contact">
            <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
              Start Your Project
            </Button>
          </Link>
        </div>
      </Section>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-surface-primary rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-brand-secondary to-brand-secondary-dark flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-brand-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <Badge variant="primary" className="mb-4">
                  {selectedProject.category}
                </Badge>
                <h3 className="text-2xl font-bold text-content-primary mb-3">
                  {selectedProject.title}
                </h3>
                <p className="text-content-secondary leading-relaxed mb-6">
                  {selectedProject.description}
                </p>

                {/* Stats Grid */}
                {selectedProject.stats && (
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-surface-secondary mb-6">
                    {Object.entries(selectedProject.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-brand-primary">{value}</div>
                        <div className="text-xs text-content-tertiary uppercase tracking-wider capitalize">
                          {key}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Link to="/contact" className="flex-1">
                    <Button fullWidth icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                      Discuss Similar Project
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
