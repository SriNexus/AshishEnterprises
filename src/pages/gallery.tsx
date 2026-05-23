import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput, FieldImageUpload } from '@/components/visual-editor/edit-modal';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { GALLERY_IMAGES } from '@/data/constants';
import toast from 'react-hot-toast';

interface GalleryItem { id: string; title: string; category: string; imageUrl: string; description?: string; isPublished?: boolean; }
const EMPTY: Omit<GalleryItem, 'id'> = { title: '', category: 'Residential', imageUrl: '', description: '', isPublished: true };

export default function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const { ref, inView } = useScrollReveal();
  const { isEditMode } = useVisualEditor();
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_IMAGES.map((g, i) => ({ id: String(i), title: (g as { title?: string; category?: string }).title || '', category: (g as { category?: string }).category || 'Residential', imageUrl: (g as { src?: string; imageUrl?: string }).src || (g as { imageUrl?: string }).imageUrl || '', isPublished: true })));
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, COLLECTIONS.GALLERY), orderBy('createdAt', 'desc')), (snap) => {
      if (snap.docs.length > 0) setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
    }, () => {});
    return () => unsub();
  }, []);

  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);

  const handleAdd = async () => {
    if (!draft.imageUrl) { toast.error('Please upload an image first'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, COLLECTIONS.GALLERY), { ...draft, isPublished: true, createdAt: serverTimestamp() });
      setAddOpen(false); setDraft(EMPTY); toast.success('Photo added!');
    } catch { toast.error('Failed to add'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this photo?')) return;
    try { await deleteDoc(doc(db, COLLECTIONS.GALLERY, id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <MainLayout>
      <PageHero title="Photo Gallery" subtitle="A visual journey through our solar installations and projects." breadcrumbs={[{ label: 'Gallery' }]} />
      <EditableSection id="gallery" label="Gallery" onAddItem={() => { setDraft(EMPTY); setAddOpen(true); }}>
        <Section background="primary" padding="lg">
          <SectionHeading badge="Gallery" title="Our Work in Pictures" subtitle="See our solar installations across homes and businesses." />
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${filter === cat ? 'bg-brand-primary text-white' : 'bg-surface-card border border-line text-content-secondary hover:border-brand-primary/30'}`}>
                {cat}
              </button>
            ))}
          </div>
          <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item, idx) => (
              <motion.div key={item.id} variants={fadeUp} className="relative group/gal">
                {isEditMode && (
                  <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 z-20 p-1 bg-red-600 text-white rounded opacity-0 group-hover/gal:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
                <div className="aspect-square rounded-xl overflow-hidden bg-surface-card border border-line cursor-pointer group hover:shadow-lg transition-all"
                  onClick={() => setLightboxIdx(idx)}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-content-tertiary text-sm">{item.title || 'No image'}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-xs font-semibold">{item.title}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </EditableSection>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && filtered[lightboxIdx] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxIdx(null)}>
            <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 text-white hover:text-amber-400 cursor-pointer"><X className="h-7 w-7" /></button>
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => ((i ?? 0) - 1 + filtered.length) % filtered.length); }}
              className="absolute left-4 text-white hover:text-amber-400 cursor-pointer"><ChevronLeft className="h-8 w-8" /></button>
            <img src={filtered[lightboxIdx].imageUrl} alt={filtered[lightboxIdx].title} className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => ((i ?? 0) + 1) % filtered.length); }}
              className="absolute right-4 text-white hover:text-amber-400 cursor-pointer"><ChevronRight className="h-8 w-8" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <EditModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Gallery Photo" onSave={handleAdd} saving={saving}>
        <Field label="Image"><FieldImageUpload currentUrl={draft.imageUrl} onUpload={(url) => setDraft(d => ({ ...d, imageUrl: url }))} folder="gallery" label="Photo" /></Field>
        <Field label="Title"><FieldInput value={draft.title} onChange={(v) => setDraft(d => ({ ...d, title: v }))} placeholder="Photo title" /></Field>
        <Field label="Category"><FieldInput value={draft.category} onChange={(v) => setDraft(d => ({ ...d, category: v }))} placeholder="Residential / Commercial / Industrial" /></Field>
      </EditModal>
    </MainLayout>
  );
}
