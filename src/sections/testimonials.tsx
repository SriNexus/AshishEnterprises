import { STRINGS } from '@/lib/strings';
/**
 * TestimonialsSection — Visual Editor Version
 * Editable via Firestore testimonials collection with visual overlays.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, Trash2, Edit2 } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { fadeUp } from '@/animations/variants';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput, FieldTextarea, FieldNumber } from '@/components/visual-editor/edit-modal';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { TESTIMONIALS as STATIC_TESTIMONIALS } from '@/data/constants';
import toast from 'react-hot-toast';

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  isPublished?: boolean;
}

const EMPTY_TESTIMONIAL: Omit<TestimonialItem, 'id'> = {
  name: '', role: '', company: '', content: '', rating: 5, isPublished: true,
};

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const { isEditMode } = useVisualEditor();
  const [items, setItems] = useState<TestimonialItem[]>(STATIC_TESTIMONIALS.map((t, i) => ({ ...t, id: String(i), isPublished: true })));
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<TestimonialItem | null>(null);
  const [draft, setDraft] = useState(EMPTY_TESTIMONIAL);
  const [saving, setSaving] = useState(false);

  // Realtime Firestore subscription
  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.TESTIMONIALS),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      if (snap.docs.length > 0) {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as TestimonialItem)));
        setActive(0);
      }
    }, () => {});
    return () => unsub();
  }, []);

  const total = items.length;
  const next = useCallback(() => setActive((c) => (c === total - 1 ? 0 : c + 1)), [total]);
  const prev = useCallback(() => setActive((c) => (c === 0 ? total - 1 : c - 1)), [total]);
  useEffect(() => { const id = setInterval(next, 6000); return () => clearInterval(id); }, [next]);

  const item = items[active] || items[0];

  const handleAdd = async () => {
    if (!draft.name || !draft.content) { toast.error('Name and content are required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, COLLECTIONS.TESTIMONIALS), {
        ...draft,
        isPublished: true,
        featured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setAddOpen(false);
      setDraft(EMPTY_TESTIMONIAL);
      toast.success('Testimonial added!');
    } catch { toast.error('Failed to add'); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.TESTIMONIALS, editItem.id), {
        name: editItem.name, role: editItem.role, company: editItem.company,
        content: editItem.content, rating: editItem.rating,
        updatedAt: serverTimestamp(),
      });
      setEditItem(null);
      toast.success('Testimonial updated!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.TESTIMONIALS, id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (!item) return null;

  return (
    <>
      <EditableSection id="testimonials" label="Testimonials" onAddItem={() => { setDraft(EMPTY_TESTIMONIAL); setAddOpen(true); }}>
        <Section id="testimonials" background="secondary" padding="lg">
          <SectionHeading badge={STRINGS.testimonials.badge} title={STRINGS.testimonials.title} subtitle={STRINGS.testimonials.subtitle} />
          <motion.div variants={fadeUp} className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl border border-line bg-surface-card overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
              <Quote className="absolute top-8 right-8 h-28 w-28 text-brand-primary/[0.04]" />
              <div className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                  <motion.div key={active} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
                    {/* Edit controls per item - only in edit mode */}
                    {isEditMode && (
                      <div className="flex gap-2 mb-4">
                        <button onClick={() => setEditItem({ ...item })}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer">
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold cursor-pointer">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    )}
                    <div className="flex gap-1 mb-8">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-content-tertiary/20'}`} />
                      ))}
                    </div>
                    <blockquote className="text-lg md:text-xl lg:text-2xl text-content-primary leading-relaxed font-medium mb-10">"{item.content}"</blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-primary/20">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-content-primary text-lg">{item.name}</div>
                        <div className="text-sm text-content-secondary">{item.role}, {item.company}</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-line">
                  <div className="flex gap-2">
                    {items.map((_, i) => (
                      <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all duration-400 cursor-pointer ${i === active ? 'bg-brand-primary w-8' : 'bg-content-tertiary/20 w-2 hover:bg-content-tertiary/40'}`} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={prev} className="w-11 h-11 rounded-xl border border-line flex items-center justify-center text-content-secondary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 cursor-pointer"><ChevronLeft className="h-5 w-5" /></button>
                    <button onClick={next} className="w-11 h-11 rounded-xl border border-line flex items-center justify-center text-content-secondary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 cursor-pointer"><ChevronRight className="h-5 w-5" /></button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Section>
      </EditableSection>

      {/* Add Testimonial Modal */}
      <EditModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Testimonial" onSave={handleAdd} saving={saving}>
        <Field label="Name"><FieldInput value={draft.name} onChange={(v) => setDraft(d => ({ ...d, name: v }))} placeholder="Customer Name" /></Field>
        <Field label="Role"><FieldInput value={draft.role} onChange={(v) => setDraft(d => ({ ...d, role: v }))} placeholder="e.g. Homeowner" /></Field>
        <Field label="Company/Location"><FieldInput value={draft.company} onChange={(v) => setDraft(d => ({ ...d, company: v }))} placeholder="e.g. Varanasi" /></Field>
        <Field label="Review"><FieldTextarea value={draft.content} onChange={(v) => setDraft(d => ({ ...d, content: v }))} placeholder="Write testimonial..." rows={4} /></Field>
        <Field label="Rating (1-5)"><FieldNumber value={draft.rating} onChange={(v) => setDraft(d => ({ ...d, rating: v }))} min={1} max={5} /></Field>
      </EditModal>

      {/* Edit Testimonial Modal */}
      {editItem && (
        <EditModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Testimonial" onSave={handleEdit} saving={saving}>
          <Field label="Name"><FieldInput value={editItem.name} onChange={(v) => setEditItem(e => e && { ...e, name: v })} /></Field>
          <Field label="Role"><FieldInput value={editItem.role} onChange={(v) => setEditItem(e => e && { ...e, role: v })} /></Field>
          <Field label="Company"><FieldInput value={editItem.company} onChange={(v) => setEditItem(e => e && { ...e, company: v })} /></Field>
          <Field label="Review"><FieldTextarea value={editItem.content} onChange={(v) => setEditItem(e => e && { ...e, content: v })} rows={4} /></Field>
          <Field label="Rating (1-5)"><FieldNumber value={editItem.rating} onChange={(v) => setEditItem(e => e && { ...e, rating: v })} min={1} max={5} /></Field>
        </EditModal>
      )}
    </>
  );
}
