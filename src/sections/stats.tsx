/**
 * StatsSection — Visual Editor Version
 * Stats editable from Firestore settings/stats
 */
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/section';
import { STATS } from '@/data/constants';
import { fadeUp } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput, FieldNumber } from '@/components/visual-editor/edit-modal';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';

interface StatItem { label: string; value: number; suffix?: string; prefix?: string; }

function useCounter(end: number, duration: number, inView: boolean) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step); else setCount(end);
    };
    requestAnimationFrame(step);
  }, [end, duration, inView]);
  return count;
}

function StatCard({ label, value, prefix, suffix, inView }: StatItem & { inView: boolean }) {
  const count = useCounter(value, 2200, inView);
  return (
    <motion.div variants={fadeUp}>
      <div className="text-center p-6 rounded-2xl bg-surface-card border border-line hover:border-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/[0.03] transition-all duration-300">
        <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-brand-primary mb-1 tabular-nums">
          {prefix}{count.toLocaleString()}{suffix}
        </div>
        <div className="text-sm text-content-secondary font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const { ref, inView } = useScrollReveal(0.3);
    const [stats, setStats] = useState<StatItem[]>(STATS);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<StatItem[]>(STATS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'stats'), (snap) => {
      if (snap.exists() && snap.data()?.items) setStats(snap.data().items);
    }, () => {});
    return () => unsub();
  }, []);

  const openEdit = () => { setDraft([...stats]); setEditOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'stats'), { items: draft, updatedAt: serverTimestamp() });
      setStats(draft); setEditOpen(false); toast.success('Stats saved!');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  return (
    <>
      <EditableSection id="stats" label="Stats Section" onEdit={openEdit}>
        <Section background="primary" padding="md">
          <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat) => <StatCard key={stat.label} {...stat} inView={inView} />)}
          </div>
        </Section>
      </EditableSection>

      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Stats" onSave={handleSave} saving={saving}>
        {draft.map((stat, i) => (
          <div key={i} className="p-4 bg-zinc-800 rounded-xl space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stat {i + 1}</p>
            <Field label="Label"><FieldInput value={stat.label} onChange={(v) => setDraft(d => d.map((s, j) => j === i ? { ...s, label: v } : s))} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Value"><FieldNumber value={stat.value} onChange={(v) => setDraft(d => d.map((s, j) => j === i ? { ...s, value: v } : s))} /></Field>
              <Field label="Prefix"><FieldInput value={stat.prefix || ''} onChange={(v) => setDraft(d => d.map((s, j) => j === i ? { ...s, prefix: v } : s))} /></Field>
              <Field label="Suffix"><FieldInput value={stat.suffix || ''} onChange={(v) => setDraft(d => d.map((s, j) => j === i ? { ...s, suffix: v } : s))} /></Field>
            </div>
          </div>
        ))}
      </EditModal>
    </>
  );
}
