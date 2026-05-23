import { STRINGS } from '@/lib/strings';
/**
 * ServicesSection — Visual Editor Version
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Building2, Zap, Wrench, BatteryCharging, BarChart3, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { fadeUp } from '@/animations/variants';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput, FieldTextarea } from '@/components/visual-editor/edit-modal';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { SERVICES as STATIC_SERVICES } from '@/data/constants';
import toast from 'react-hot-toast';

interface ServiceItem { id: string; title: string; description: string; icon: string; slug?: string; isPublished?: boolean; }
const iconMap: Record<string, React.ElementType> = { Home, Building2, Zap, Wrench, BatteryCharging, BarChart3 };
const EMPTY_SERVICE: Omit<ServiceItem, 'id'> = { title: '', description: '', icon: 'Zap', slug: '', isPublished: true };

export function ServicesSection() {
  const { isEditMode } = useVisualEditor();
  const [services, setServices] = useState<ServiceItem[]>(
    STATIC_SERVICES.map(s => ({ ...s, isPublished: true }))
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ServiceItem | null>(null);
  const [draft, setDraft] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, COLLECTIONS.SERVICES), where('isPublished', '==', true)),
      (snap) => { if (snap.docs.length > 0) setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem))); },
      () => {}
    );
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!draft.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, COLLECTIONS.SERVICES), { ...draft, isPublished: true, features: [], benefits: [], process: [], specs: {}, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setAddOpen(false); setDraft(EMPTY_SERVICE); toast.success('Service added!');
    } catch { toast.error('Failed to add'); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.SERVICES, editItem.id), { title: editItem.title, description: editItem.description, icon: editItem.icon, updatedAt: serverTimestamp() });
      setEditItem(null); toast.success('Service updated!');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try { await deleteDoc(doc(db, COLLECTIONS.SERVICES, id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <EditableSection id="services" label="Services Section" onAddItem={() => { setDraft(EMPTY_SERVICE); setAddOpen(true); }}>
        <Section id="services" background="primary" padding="lg">
          <SectionHeading badge={STRINGS.services.badge} title={STRINGS.services.title} subtitle={STRINGS.services.subtitle} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => {
              const Icon = iconMap[service.icon] || Zap;
              return (
                <motion.div key={service.id} variants={fadeUp} className="relative group/card">
                  {isEditMode && (
                    <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button onClick={() => setEditItem({ ...service })} className="p-1 bg-blue-600 text-white rounded cursor-pointer"><Edit2 className="h-3 w-3" /></button>
                      <button onClick={() => handleDelete(service.id)} className="p-1 bg-red-600 text-white rounded cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  )}
                  <Link to={`/services/${service.slug || service.id}`} className="block h-full">
                    <div className="group h-full rounded-2xl border border-line bg-surface-card p-6 hover:shadow-xl hover:shadow-brand-primary/[0.04] hover:-translate-y-1 transition-all duration-300">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:shadow-lg group-hover:shadow-brand-primary/25 transition-all duration-300">
                        <Icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-base font-bold text-content-primary mb-2 group-hover:text-brand-primary transition-colors">{service.title}</h3>
                      <p className="text-sm text-content-secondary leading-relaxed mb-5">{service.description}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary group-hover:gap-2.5 transition-all duration-300 mt-auto">
                        {STRINGS.services.learnMore} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <motion.div variants={fadeUp} className="text-center mt-10">
            <Link to="/services"><Button variant="outline" size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">{STRINGS.services.viewAll}</Button></Link>
          </motion.div>
        </Section>
      </EditableSection>

      <EditModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Service" onSave={handleAdd} saving={saving}>
        <Field label="Title"><FieldInput value={draft.title} onChange={(v) => setDraft(d => ({ ...d, title: v }))} placeholder="Service Name" /></Field>
        <Field label="Description"><FieldTextarea value={draft.description} onChange={(v) => setDraft(d => ({ ...d, description: v }))} rows={3} /></Field>
        <Field label="Icon" hint="One of: Home, Building2, Zap, Wrench, BatteryCharging, BarChart3">
          <FieldInput value={draft.icon} onChange={(v) => setDraft(d => ({ ...d, icon: v }))} placeholder="Zap" />
        </Field>
        <Field label="URL Slug"><FieldInput value={draft.slug || ''} onChange={(v) => setDraft(d => ({ ...d, slug: v }))} placeholder="my-service" /></Field>
      </EditModal>

      {editItem && (
        <EditModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Service" onSave={handleEdit} saving={saving}>
          <Field label="Title"><FieldInput value={editItem.title} onChange={(v) => setEditItem(e => e && { ...e, title: v })} /></Field>
          <Field label="Description"><FieldTextarea value={editItem.description} onChange={(v) => setEditItem(e => e && { ...e, description: v })} rows={3} /></Field>
          <Field label="Icon"><FieldInput value={editItem.icon} onChange={(v) => setEditItem(e => e && { ...e, icon: v })} /></Field>
        </EditModal>
      )}
    </>
  );
}
