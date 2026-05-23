import { STRINGS } from '@/lib/strings';
/**
 * FAQSection — Visual Editor Version
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { fadeUp } from '@/animations/variants';
import { cn } from '@/utils/cn';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput, FieldTextarea } from '@/components/visual-editor/edit-modal';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { FAQS as STATIC_FAQS } from '@/data/constants';
import toast from 'react-hot-toast';

interface FAQItem { id: string; question: string; answer: string; isPublished?: boolean; order?: number; }

const EMPTY_FAQ: Omit<FAQItem, 'id'> = { question: '', answer: '', isPublished: true };

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { isEditMode } = useVisualEditor();
  const [faqs, setFaqs] = useState<FAQItem[]>(
    STATIC_FAQS.slice(0, 6).map(f => ({ ...f, isPublished: true }))
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<FAQItem | null>(null);
  const [draft, setDraft] = useState(EMPTY_FAQ);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, COLLECTIONS.FAQ), where('isPublished', '==', true)),
      (snap) => { if (snap.docs.length > 0) setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() } as FAQItem))); },
      () => {}
    );
    return () => unsub();
  }, []);

  useEffect(() => { if (faqs[0]) setOpenId(faqs[0].id); }, [faqs]);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const handleAdd = async () => {
    if (!draft.question || !draft.answer) { toast.error('Question and answer are required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, COLLECTIONS.FAQ), { ...draft, isPublished: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setAddOpen(false); setDraft(EMPTY_FAQ); toast.success('FAQ added!');
    } catch { toast.error('Failed to add'); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.FAQ, editItem.id), { question: editItem.question, answer: editItem.answer, updatedAt: serverTimestamp() });
      setEditItem(null); toast.success('FAQ updated!');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try { await deleteDoc(doc(db, COLLECTIONS.FAQ, id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <EditableSection id="faq" label="FAQ Section" onAddItem={() => { setDraft(EMPTY_FAQ); setAddOpen(true); }}>
        <Section id="faq" background="secondary" padding="lg">
          <SectionHeading badge={STRINGS.faq.badge} title={STRINGS.faq.title} subtitle={STRINGS.faq.subtitle} />
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.slice(0, 6).map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div key={faq.id} variants={fadeUp}
                  className={cn('rounded-2xl border transition-all duration-300', isOpen ? 'border-brand-primary/30 bg-brand-primary/[0.03] shadow-sm' : 'border-line bg-surface-card hover:border-brand-primary/15')}>
                  <div className="flex items-center">
                    <button onClick={() => toggle(faq.id)} className="flex-1 flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer">
                      <span className={cn('text-[15px] font-semibold transition-colors', isOpen ? 'text-brand-primary' : 'text-content-primary')}>{faq.question}</span>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
                        className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors', isOpen ? 'bg-brand-primary/10' : 'bg-surface-secondary')}>
                        <ChevronDown className={cn('h-4 w-4 transition-colors', isOpen ? 'text-brand-primary' : 'text-content-tertiary')} />
                      </motion.div>
                    </button>
                    {isEditMode && (
                      <div className="flex gap-1 pr-4">
                        <button onClick={() => setEditItem({ ...faq })} className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer"><Edit2 className="h-3 w-3" /></button>
                        <button onClick={() => handleDelete(faq.id)} className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6"><p className="text-sm text-content-secondary leading-relaxed">{faq.answer}</p></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          <motion.div variants={fadeUp} className="text-center mt-10">
            <Link to="/faq"><Button variant="outline" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">{STRINGS.faq.viewAll}</Button></Link>
          </motion.div>
        </Section>
      </EditableSection>

      <EditModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add FAQ" onSave={handleAdd} saving={saving}>
        <Field label="Question"><FieldInput value={draft.question} onChange={(v) => setDraft(d => ({ ...d, question: v }))} placeholder="What is...?" /></Field>
        <Field label="Answer"><FieldTextarea value={draft.answer} onChange={(v) => setDraft(d => ({ ...d, answer: v }))} rows={5} /></Field>
      </EditModal>

      {editItem && (
        <EditModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit FAQ" onSave={handleEdit} saving={saving}>
          <Field label="Question"><FieldInput value={editItem.question} onChange={(v) => setEditItem(e => e && { ...e, question: v })} /></Field>
          <Field label="Answer"><FieldTextarea value={editItem.answer} onChange={(v) => setEditItem(e => e && { ...e, answer: v })} rows={5} /></Field>
        </EditModal>
      )}
    </>
  );
}
