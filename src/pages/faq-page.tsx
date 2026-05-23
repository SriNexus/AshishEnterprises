import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, ArrowRight, MessageCircle } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FAQS, SITE_CONFIG } from '@/data/constants';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { cn } from '@/utils/cn';

const categories = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General' },
  { id: 'technical', label: 'Technical' },
  { id: 'pricing', label: 'Pricing & Subsidies' },
  { id: 'maintenance', label: 'Maintenance' },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { ref, inView } = useScrollReveal();

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <MainLayout>
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about solar energy, installations, and our services."
        breadcrumbs={[{ label: 'FAQ' }]}
      />

      <Section background="primary" padding="lg">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="max-w-md mx-auto"
            />
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer',
                  category === cat.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-surface-secondary border border-line text-content-secondary hover:border-brand-primary/30 hover:text-brand-primary'
                )}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="space-y-3"
          >
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    variants={fadeUp}
                    className={cn(
                      'rounded-2xl border transition-all duration-300',
                      isOpen
                        ? 'border-brand-primary/30 bg-brand-primary/5 shadow-md'
                        : 'border-line bg-surface-card'
                    )}
                  >
                    <button
                      onClick={() => toggle(faq.id)}
                      className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={cn(
                          'text-base font-semibold transition-colors',
                          isOpen ? 'text-brand-primary' : 'text-content-primary'
                        )}
                      >
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 transition-colors',
                            isOpen ? 'text-brand-primary' : 'text-content-tertiary'
                          )}
                        />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                            <p className="text-sm text-content-secondary leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-content-secondary">No questions found matching your search.</p>
              </div>
            )}
          </motion.div>
        </div>
      </Section>

      {/* Still Have Questions */}
      <Section background="secondary" padding="lg">
        <SectionHeading
          badge="Need More Help?"
          title="Still Have Questions?"
          subtitle="Can't find what you're looking for? Our team is ready to help."
        />

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="text-center" padding="lg">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-7 w-7 text-brand-primary" />
            </div>
            <h3 className="font-bold text-content-primary mb-2">Chat with Us</h3>
            <p className="text-sm text-content-secondary mb-4">
              Get instant answers via WhatsApp chat.
            </p>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi! I have a question.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" fullWidth>
                Start Chat
              </Button>
            </a>
          </Card>

          <Card className="text-center" padding="lg">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
              <ArrowRight className="h-7 w-7 text-brand-primary" />
            </div>
            <h3 className="font-bold text-content-primary mb-2">Contact Form</h3>
            <p className="text-sm text-content-secondary mb-4">
              Send us a detailed message and we'll respond within 24 hours.
            </p>
            <Link to="/contact">
              <Button variant="outline" fullWidth>
                Contact Us
              </Button>
            </Link>
          </Card>
        </div>
      </Section>
    </MainLayout>
  );
}
