import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sun, Battery, Lightbulb, Droplets, Cpu, ArrowRight, Phone, MessageCircle, Info, Package } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SITE_CONFIG } from '@/data/constants';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { useSite } from '@/store/site-context';
import { useTranslation } from '@/hooks/useTranslation';

const categoryIcons: Record<string, React.ElementType> = {
  'solar-panels': Sun, 'solar-inverters': Cpu, 'batteries': Battery,
  'solar-street-lights': Lightbulb, 'solar-water-heaters': Droplets,
  'solar-systems': Sun, 'solar-accessories': Package,
};

export default function ProductsPage() {
  const { ref, inView } = useScrollReveal();
  const { products: fsProducts, hasFirestoreProducts, staticProducts } = useSite();
  const { t } = useTranslation();

  // Firestore products grouped by category
  const fsCategoryMap = new Map<string, typeof fsProducts>();
  fsProducts.forEach(p => {
    const cat = p.category || 'Other';
    if (!fsCategoryMap.has(cat)) fsCategoryMap.set(cat, []);
    fsCategoryMap.get(cat)!.push(p);
  });
  const fsCategories = Array.from(fsCategoryMap.keys());

  // For static tab system
  const [activeCategory, setActiveCategory] = useState<string>(staticProducts[0]?.id || '');
  const activeStaticProduct = staticProducts.find((p) => p.id === activeCategory);

  return (
    <MainLayout>
      <PageHero
        title={t.pages.productsTitle}
        subtitle={t.pages.productsSubtitle}
        breadcrumbs={[{ label: t.nav.products }]}
      />

      {/* ══════════════════════════════════════════
          MODE 1: Firestore products (admin-managed)
          Rendered as category-grouped cards
          ══════════════════════════════════════════ */}
      {hasFirestoreProducts && fsProducts.length > 0 ? (
        <Section background="primary" padding="lg">
          <SectionHeading badge={t.nav.products} title={t.pages.productsTitle} subtitle={t.pages.productsSubtitle} />

          {fsCategories.map(cat => (
            <div key={cat} className="mb-12 last:mb-0">
              <h3 className="text-lg font-bold text-content-primary mb-4 flex items-center gap-2">
                {(() => { const Icon = categoryIcons[cat.toLowerCase().replace(/\s/g, '-')] || Package; return <Icon className="w-5 h-5 text-brand-primary" />; })()}
                {cat}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fsCategoryMap.get(cat)!.map(product => (
                  <Card key={product.id} className="h-full group" padding="md">
                    {product.images?.[0] ? (
                      <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-surface-secondary">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl mb-4 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 flex items-center justify-center">
                        <Package className="w-10 h-10 text-brand-primary/20" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="font-bold text-content-primary group-hover:text-brand-primary transition-colors">{product.name}</h4>
                      {product.brand && <Badge variant="secondary">{product.brand}</Badge>}
                      <p className="text-sm text-content-secondary line-clamp-2">{product.description}</p>
                      {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="pt-3 space-y-1.5 text-xs text-content-secondary border-t border-line mt-3">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key}</span>
                              <span className="font-medium text-content-primary">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="pt-3">
                        <a href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi! I want to inquire about ${product.name}.`}
                          target="_blank" rel="noopener noreferrer">
                          <Button size="sm" fullWidth variant="outline" icon={<MessageCircle className="h-4 w-4" />}>
                            Inquire Now
                          </Button>
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </Section>
      ) : (
        /* ══════════════════════════════════════════
           MODE 2: Static products (fallback)
           Tab-based category view from constants
           ══════════════════════════════════════════ */
        <Section background="primary" padding="lg">
          <SectionHeading badge={t.nav.products} title={t.pages.productsTitle} subtitle={t.pages.productsSubtitle} />

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {staticProducts.map((product) => {
              const CatIcon = categoryIcons[product.id] || Sun;
              const isActive = activeCategory === product.id;
              return (
                <button key={product.id} onClick={() => setActiveCategory(product.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-surface-secondary border border-line text-content-secondary hover:border-brand-primary/30 hover:text-brand-primary'
                  }`}>
                  <CatIcon className="h-4 w-4" />{product.category}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeStaticProduct && (
              <motion.div key={activeCategory} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 p-6 rounded-2xl bg-surface-secondary border border-line">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      {(() => { const I = categoryIcons[activeCategory] || Sun; return <I className="h-7 w-7 text-brand-primary" />; })()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-content-primary">{activeStaticProduct.category}</h3>
                      <p className="text-sm text-content-secondary">{activeStaticProduct.description}</p>
                    </div>
                  </div>
                  <a href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi! I'm interested in ${activeStaticProduct.category}.`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" icon={<MessageCircle className="h-4 w-4" />}>WhatsApp</Button>
                  </a>
                </div>

                <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {activeStaticProduct.items.map((item, idx) => (
                    <motion.div key={idx} variants={fadeUp}>
                      <Card className="h-full group" padding="md">
                        <div className="aspect-square rounded-xl bg-gradient-to-br from-brand-secondary/10 to-brand-primary/5 flex items-center justify-center mb-4 group-hover:from-brand-primary/10 group-hover:to-brand-primary/20 transition-all">
                          {(() => { const I = categoryIcons[activeCategory] || Sun; return <I className="h-16 w-16 text-brand-primary/30 group-hover:text-brand-primary/50 transition-colors" />; })()}
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-content-primary group-hover:text-brand-primary transition-colors">{item.name}</h4>
                          {'brand' in item && <Badge variant="secondary">{item.brand}</Badge>}
                          {'type' in item && <Badge variant="outline">{item.type}</Badge>}
                          <div className="pt-3 space-y-1.5 text-xs text-content-secondary">
                            {Object.entries(item).filter(([key]) => !['name', 'brand', 'type'].includes(key)).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="font-medium text-content-primary">{value as string}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-4">
                            <a href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi! I want to inquire about ${item.name}.`} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" fullWidth variant="outline" icon={<Info className="h-4 w-4" />}>Inquire Now</Button>
                            </a>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>
      )}

      {/* Quality Section */}
      <Section background="secondary" padding="lg">
        <SectionHeading badge="Quality Assurance" title="Why Choose Our Products?" subtitle="We only stock products that meet our stringent quality standards." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Tier-1 Brands', desc: 'Products from globally recognized manufacturers' },
            { title: 'Warranty Backed', desc: 'Full manufacturer warranty on all products' },
            { title: 'Technical Support', desc: 'Expert guidance on product selection' },
            { title: 'Best Pricing', desc: 'Competitive prices with no hidden costs' },
          ].map((item, idx) => (
            <motion.div key={idx} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="text-center h-full" padding="lg">
                <div className="w-12 h-12 mx-auto rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-brand-primary">{idx + 1}</span>
                </div>
                <h4 className="font-bold text-content-primary mb-2">{item.title}</h4>
                <p className="text-sm text-content-secondary">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section background="gradient" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">Need Help Choosing?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">Our experts can help you select the perfect products for your requirements.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">{t.common.getQuote}</Button>
            </Link>
            <a href={`tel:${SITE_CONFIG.phone}`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-secondary" icon={<Phone className="h-5 w-5" />}>
                {t.common.callNow}
              </Button>
            </a>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
