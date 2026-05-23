import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Battery, Lightbulb, Droplets, Cpu, Phone, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRODUCTS, SITE_CONFIG } from '@/data/constants';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { useSite } from '@/store/site-context';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput, FieldTextarea, FieldImageUpload } from '@/components/visual-editor/edit-modal';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import toast from 'react-hot-toast';

interface ProductItem { id: string; name: string; category: string; description: string; brand?: string; images?: string[]; featured?: boolean; isPublished?: boolean; specifications?: Record<string, string>; }
const EMPTY_PRODUCT: Omit<ProductItem, 'id'> = { name: '', category: '', description: '', brand: '', images: [], featured: false, isPublished: true };
const categoryIcons: Record<string, React.ElementType> = { 'solar-panels': Sun, 'solar-inverters': Cpu, batteries: Battery, 'solar-street-lights': Lightbulb, 'solar-water-heaters': Droplets };

export default function ProductsPage() {
  const { ref, inView } = useScrollReveal();
  const { config } = useSite();
  const { isEditMode } = useVisualEditor();
  const [products, setProducts] = useState<ProductItem[]>(
    (PRODUCTS as Array<{ id: string; name?: string; category?: string; description: string }>)
      .map(p => ({ id: p.id, name: p.name || p.id, category: p.category || p.id, description: p.description, isPublished: true as const }))
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductItem | null>(null);
  const [draft, setDraft] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, COLLECTIONS.PRODUCTS), where('isPublished', '==', true)),
      (snap) => {
        if (snap.docs.length > 0) {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductItem));
          setProducts(docs);
          if (!activeCategory) setActiveCategory(docs[0]?.id || '');
        } else {
          if (!activeCategory && PRODUCTS[0]) setActiveCategory(PRODUCTS[0].id);
        }
      }, () => { if (!activeCategory && PRODUCTS[0]) setActiveCategory(PRODUCTS[0].id); }
    );
    return () => unsub();
  }, []);

  const categories = [...new Set(products.map(p => p.category))];
  const activeProduct = products.find(p => p.id === activeCategory) || products[0];
  const Icon = categoryIcons[activeCategory] || Sun;
  const whatsapp = config.whatsapp || SITE_CONFIG.whatsapp;
  const phone = config.phone || SITE_CONFIG.phone;

  const handleAdd = async () => {
    if (!draft.name) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, COLLECTIONS.PRODUCTS), { ...draft, isPublished: true, specifications: {}, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setAddOpen(false); setDraft(EMPTY_PRODUCT); toast.success('Product added!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleEditSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.PRODUCTS, editItem.id), { name: editItem.name, description: editItem.description, brand: editItem.brand, updatedAt: serverTimestamp() });
      setEditItem(null); toast.success('Updated!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <MainLayout>
      <PageHero title="Our Products" subtitle="Premium quality solar panels, inverters, batteries from leading brands." breadcrumbs={[{ label: 'Products' }]} />
      <EditableSection id="products" label="Products" onAddItem={() => { setDraft(EMPTY_PRODUCT); setAddOpen(true); }}>
        <Section background="primary" padding="lg">
          <SectionHeading badge="Products" title="Our Product Range" subtitle="Certified solar products from trusted manufacturers." />
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map(cat => {
              const CatIcon = categoryIcons[cat] || Sun;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeCategory === cat ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'bg-surface-card border border-line text-content-secondary hover:border-brand-primary/30'}`}>
                  <CatIcon className="h-4 w-4" />{cat}
                </button>
              );
            })}
          </div>

          {activeProduct && (
            <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
              <motion.div variants={fadeUp} className="relative">
                {isEditMode && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <button onClick={() => setEditItem({ ...activeProduct })} className="p-1.5 bg-blue-600 text-white rounded cursor-pointer"><Edit2 className="h-3 w-3" /></button>
                    <button onClick={() => handleDelete(activeProduct.id)} className="p-1.5 bg-red-600 text-white rounded cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                  </div>
                )}
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 flex items-center justify-center overflow-hidden">
                  {activeProduct.images?.[0] ? (
                    <img src={activeProduct.images[0]} alt={activeProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="h-24 w-24 text-brand-primary/30" />
                  )}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-6">
                {activeProduct.brand && <Badge variant="primary">{activeProduct.brand}</Badge>}
                <h2 className="text-2xl font-bold text-content-primary">{activeProduct.name}</h2>
                <p className="text-content-secondary leading-relaxed">{activeProduct.description}</p>
                {activeProduct.specifications && Object.keys(activeProduct.specifications).length > 0 && (
                  <div className="rounded-2xl bg-surface-card border border-line overflow-hidden">
                    <div className="px-5 py-3 bg-brand-primary/5 border-b border-line"><h4 className="text-sm font-bold text-content-primary">Specifications</h4></div>
                    <div className="divide-y divide-line">
                      {Object.entries(activeProduct.specifications).map(([k, v]) => (
                        <div key={k} className="flex justify-between px-5 py-3 text-sm">
                          <span className="text-content-secondary">{k}</span>
                          <span className="text-content-primary font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" icon={<MessageCircle className="h-4 w-4" />}>Enquire on WhatsApp</Button>
                  </a>
                  <a href={`tel:${phone}`}>
                    <Button size="lg" variant="outline" icon={<Phone className="h-4 w-4" />}>Call for Price</Button>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </Section>
      </EditableSection>

      <EditModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Product" onSave={handleAdd} saving={saving}>
        <Field label="Name"><FieldInput value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} placeholder="Product name" /></Field>
        <Field label="Category"><FieldInput value={draft.category} onChange={v => setDraft(d => ({ ...d, category: v }))} placeholder="solar-panels" /></Field>
        <Field label="Brand"><FieldInput value={draft.brand || ''} onChange={v => setDraft(d => ({ ...d, brand: v }))} placeholder="Tata Solar" /></Field>
        <Field label="Description"><FieldTextarea value={draft.description} onChange={v => setDraft(d => ({ ...d, description: v }))} rows={3} /></Field>
        <Field label="Product Image"><FieldImageUpload onUpload={url => setDraft(d => ({ ...d, images: [url] }))} folder="products" /></Field>
      </EditModal>

      {editItem && (
        <EditModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Product" onSave={handleEditSave} saving={saving}>
          <Field label="Name"><FieldInput value={editItem.name} onChange={v => setEditItem(e => e && { ...e, name: v })} /></Field>
          <Field label="Brand"><FieldInput value={editItem.brand || ''} onChange={v => setEditItem(e => e && { ...e, brand: v })} /></Field>
          <Field label="Description"><FieldTextarea value={editItem.description} onChange={v => setEditItem(e => e && { ...e, description: v })} rows={3} /></Field>
        </EditModal>
      )}
    </MainLayout>
  );
}
