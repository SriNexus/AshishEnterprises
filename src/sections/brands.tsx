import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/section';
import { fadeUp } from '@/animations/variants';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldTextarea } from '@/components/visual-editor/edit-modal';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';

const DEFAULT_BRANDS = ['Tata Solar', 'Adani Solar', 'Luminous', 'Havells', 'Vikram Solar', 'Waaree', 'Microtek', 'Polycab'];

export function BrandsSection() {
      const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(DEFAULT_BRANDS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'brands'), (snap) => {
      if (snap.exists() && snap.data()?.items) setBrands(snap.data().items);
    }, () => {});
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'brands'), { items: draft, updatedAt: serverTimestamp() });
      setBrands(draft); setEditOpen(false); toast.success('Brands saved!');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  return (
    <>
      <EditableSection id="brands" label="Brand Partners" onEdit={() => { setDraft([...brands]); setEditOpen(true); }}>
        <Section background="secondary" padding="sm" className="py-10 md:py-14">
          <motion.div variants={fadeUp} className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-content-tertiary">Trusted Partners & Brands We Work With</p>
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {brands.map((brand) => (
              <div key={brand} className="group px-5 py-3 rounded-xl border border-line/60 bg-surface-card/60 hover:border-brand-primary/25 hover:bg-brand-primary/[0.03] transition-all duration-300">
                <span className="text-sm font-semibold text-content-tertiary group-hover:text-brand-primary transition-colors duration-300 whitespace-nowrap">{brand}</span>
              </div>
            ))}
          </motion.div>
        </Section>
      </EditableSection>

      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Brand Partners" onSave={handleSave} saving={saving}>
        <Field label="Brand Names" hint="One brand per line">
          <FieldTextarea value={draft.join('\n')} onChange={(v) => setDraft(v.split('\n').filter(Boolean))} rows={10} placeholder="Tata Solar&#10;Adani Solar&#10;..." />
        </Field>
      </EditModal>
    </>
  );
}
