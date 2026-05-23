import { STRINGS } from '@/lib/strings';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, KeyRound, Headphones, BadgePercent, Timer, Edit2 } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { BENEFITS } from '@/data/constants';
import { fadeUp } from '@/animations/variants';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput, FieldTextarea } from '@/components/visual-editor/edit-modal';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';

const iconMap: Record<string, React.ElementType> = { ShieldCheck, Award, Key: KeyRound, Headphones, BadgePercent, Timer, KeyRound };

interface BenefitItem { title: string; description: string; icon: string; }

export function BenefitsSection() {
  const { isEditMode } = useVisualEditor();
  const [items, setItems] = useState<BenefitItem[]>([...BENEFITS]);
  const [editOpen, setEditOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<BenefitItem>({ title: '', description: '', icon: 'ShieldCheck' });
  const [allDraft, setAllDraft] = useState<BenefitItem[]>([...BENEFITS]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'benefits'), (snap) => {
      if (snap.exists() && snap.data()?.items) setItems(snap.data().items);
    }, () => {});
    return () => unsub();
  }, []);

  const openEditAll = () => { setAllDraft([...items]); setEditIdx(null); setEditOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = editIdx !== null
        ? items.map((it, i) => i === editIdx ? draft : it)
        : allDraft;
      await setDoc(doc(db, 'settings', 'benefits'), { items: toSave, updatedAt: serverTimestamp() }, { merge: true });
      setItems(toSave);
      setEditOpen(false);
      toast.success('Benefits saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <EditableSection id="benefits" label="Benefits" onEdit={openEditAll}>
        <Section id="benefits" background="secondary" padding="lg">
          <SectionHeading badge={STRINGS.benefits.badge} title={STRINGS.benefits.title} subtitle={STRINGS.benefits.subtitle} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, idx) => {
              const Icon = iconMap[item.icon] || ShieldCheck;
              return (
                <motion.div key={idx} variants={fadeUp} className="group relative">
                  {isEditMode && (
                    <div className="absolute top-0 right-0 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setDraft({ ...item }); setEditIdx(idx); setEditOpen(true); }} className="p-1 bg-blue-600 text-white rounded cursor-pointer"><Edit2 className="h-3 w-3" /></button>
                    </div>
                  )}
                  <div className="flex gap-5">
                    <div className="flex-shrink-0">
                      <div className="w-13 h-13 rounded-2xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-all duration-300">
                        <Icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-primary/30 mb-1 tabular-nums">{String(idx + 1).padStart(2, '0')}</div>
                      <h3 className="text-base font-bold text-content-primary mb-1.5">{item.title}</h3>
                      <p className="text-sm text-content-secondary leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>
      </EditableSection>

      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title={editIdx !== null ? 'Edit Benefit' : 'Edit All Benefits'} onSave={handleSave} saving={saving}>
        {editIdx !== null ? (
          <>
            <Field label="Title"><FieldInput value={draft.title} onChange={(v) => setDraft(d => ({ ...d, title: v }))} /></Field>
            <Field label="Description"><FieldTextarea value={draft.description} onChange={(v) => setDraft(d => ({ ...d, description: v }))} rows={3} /></Field>
            <Field label="Icon" hint="ShieldCheck, Award, KeyRound, Headphones, BadgePercent, Timer"><FieldInput value={draft.icon} onChange={(v) => setDraft(d => ({ ...d, icon: v }))} /></Field>
          </>
        ) : (
          allDraft.map((item, i) => (
            <div key={i} className="p-4 bg-zinc-800 rounded-xl space-y-3">
              <p className="text-xs font-bold text-zinc-400 uppercase">Benefit {i + 1}</p>
              <Field label="Title"><FieldInput value={item.title} onChange={(v) => setAllDraft(d => d.map((x, j) => j === i ? { ...x, title: v } : x))} /></Field>
              <Field label="Description"><FieldTextarea value={item.description} onChange={(v) => setAllDraft(d => d.map((x, j) => j === i ? { ...x, description: v } : x))} rows={2} /></Field>
            </div>
          ))
        )}
      </EditModal>
    </>
  );
}
