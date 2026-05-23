import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Sun, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { GALLERY_IMAGES } from '@/data/constants';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { useSite } from '@/store/site-context';

// Build categories from gallery data

export default function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { ref, inView } = useScrollReveal();
  const { gallery: firestoreGallery, hasFirestoreGallery } = useSite();

  // Use Firestore gallery if available, otherwise static
  const galleryData = hasFirestoreGallery
    ? firestoreGallery.map(g => ({ id: g.id || '', title: g.title, category: g.category, description: g.description || '', imageUrl: g.imageUrl }))
    : GALLERY_IMAGES;

  const categories = ['All', ...new Set(galleryData.map((img) => img.category))];

  const filteredImages = filter === 'All'
    ? galleryData
    : galleryData.filter((img) => img.category === filter);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <MainLayout>
      <PageHero
        title="Photo Gallery"
        subtitle="A visual journey through our solar installations and projects."
        breadcrumbs={[{ label: 'Gallery' }]}
      />

      <Section background="primary" padding="lg">
        <SectionHeading
          badge="Gallery"
          title="Our Work in Pictures"
          subtitle="Browse through images of our completed projects and installations."
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

        {/* Gallery Grid */}
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                variants={fadeUp}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => openLightbox(index)}
                className={`group cursor-pointer rounded-2xl overflow-hidden border border-line hover:shadow-xl transition-all duration-300 ${
                  index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className="relative aspect-square bg-gradient-to-br from-brand-secondary to-brand-secondary-dark overflow-hidden">
                  {/* Image or Placeholder */}
                  {'imageUrl' in image && image.imageUrl ? (
                    <img src={image.imageUrl as string} alt={image.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sun className="w-12 h-12 text-brand-primary/30" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h4 className="text-white font-semibold text-sm">{image.title}</h4>
                    <p className="text-white/70 text-xs mt-1">{image.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Section>

      {/* CTA */}
      <Section background="gradient" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
            Like What You See?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Let us create a beautiful solar installation for your property.
          </p>
          <Link to="/contact">
            <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
              Get Started
            </Button>
          </Link>
        </div>
      </Section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl mx-4 aspect-video bg-gradient-to-br from-brand-secondary to-brand-secondary-dark rounded-2xl overflow-hidden flex items-center justify-center"
            >
              {'imageUrl' in filteredImages[lightboxIndex] && filteredImages[lightboxIndex].imageUrl ? (
                <img src={filteredImages[lightboxIndex].imageUrl as string} alt={filteredImages[lightboxIndex].title} className="w-full h-full object-contain" />
              ) : (
                <Sun className="w-24 h-24 text-brand-primary/30" />
              )}
              
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h4 className="text-white font-semibold text-lg">
                  {filteredImages[lightboxIndex].title}
                </h4>
                <p className="text-white/70 text-sm mt-1">
                  {filteredImages[lightboxIndex].description}
                </p>
              </div>
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
