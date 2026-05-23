import { STRINGS } from '@/lib/strings';
/**
 * AboutSection — Visual Editor Version
 * Checkpoints and content editable via Firestore settings/about
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, Users, TrendingUp } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { fadeLeft, fadeRight } from '@/animations/variants';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { InlineImageEditor } from '@/components/visual-editor/inline-image-editor';
import { EditModal, Field, FieldInput, FieldTextarea } from '@/components/visual-editor/edit-modal';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';

interface AboutContent {
  imageUrl?: string;
  yearsText?: string;
  checkpoints?: string[];
  p1?: string;
  p2?: string;
}

const DEFAULT_CONTENT: AboutContent = {
  yearsText: '8+',
  checkpoints: [
    'UPNEDA authorized solar installer',
    'Tier-1 panels from Tata, Adani, Waaree',
    'Complete turnkey solar solutions',
    'Dedicated after-sales support team',
    'PM Surya Ghar subsidy assistance',
    'Net metering setup included',
  ],
};

export function AboutSection() {
    const [content, setContent] = useState<AboutContent>(DEFAULT_CONTENT);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<AboutContent>(DEFAULT_CONTENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'about'), (snap) => {
      if (snap.exists()) setContent({ ...DEFAULT_CONTENT, ...snap.data() });
    }, () => {});
    return () => unsub();
  }, []);

  const openEdit = () => { setDraft({ ...content }); setEditOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'about'), { ...draft, updatedAt: serverTimestamp() }, { merge: true });
      setContent(draft); setEditOpen(false); toast.success('About section saved!');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const handleImageReplace = async (url: string) => {
    const updated = { ...content, imageUrl: url };
    await setDoc(doc(db, 'settings', 'about'), { imageUrl: url, updatedAt: serverTimestamp() }, { merge: true });
    setContent(updated);
  };

  const highlights = [
    { icon: Award, label: STRINGS.about.highlights[0] },
    { icon: Users, label: STRINGS.about.highlights[1] },
    { icon: TrendingUp, label: STRINGS.about.highlights[2] },
  ];

  const checkpoints = content.checkpoints || DEFAULT_CONTENT.checkpoints || [];

  return (
    <>
      <EditableSection id="about" label="About Section" onEdit={openEdit} onReplaceImage={undefined}>
        <Section id="about" background="secondary" padding="lg">
          <SectionHeading badge={STRINGS.about.badge} title={STRINGS.about.title} subtitle={STRINGS.about.subtitle} />

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-4">
            <motion.div variants={fadeLeft} className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-brand-secondary to-brand-secondary-dark">
                {content.imageUrl ? (
                  <InlineImageEditor
                    src={content.imageUrl}
                    alt="About us"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                    onReplace={handleImageReplace}
                    storageFolder="about"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <motion.div className="absolute inset-0 rounded-full border-2 border-brand-primary/30" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
                      <motion.div className="absolute inset-4 rounded-full border-2 border-brand-primary/20" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center">
                          <span className="text-3xl">☀️</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <motion.div className="absolute -bottom-6 -right-4 sm:right-8 bg-brand-primary rounded-2xl p-5 shadow-xl shadow-brand-primary/20"
                animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="text-center text-white">
                  <div className="text-3xl font-bold font-heading">{content.yearsText || '8+'}</div>
                  <div className="text-xs font-medium opacity-80">Years</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeRight} className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {highlights.map(({ icon: Icon, label }) => (
                  <div key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
                    <Icon className="h-4 w-4" />{label}
                  </div>
                ))}
              </div>
              {(content.p1 || STRINGS.about.p1) && <p className="text-content-secondary leading-relaxed">{content.p1 || STRINGS.about.p1}</p>}
              {(content.p2 || STRINGS.about.p2) && <p className="text-content-secondary leading-relaxed">{content.p2 || STRINGS.about.p2}</p>}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {checkpoints.map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-content-primary font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Section>
      </EditableSection>

      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit About Section" onSave={handleSave} saving={saving}>
        <Field label="Years Badge Text" hint="e.g. '8+'">
          <FieldInput value={draft.yearsText || '8+'} onChange={(v) => setDraft(d => ({ ...d, yearsText: v }))} />
        </Field>
        <Field label="Paragraph 1">
          <FieldTextarea value={draft.p1 || ''} onChange={(v) => setDraft(d => ({ ...d, p1: v }))} rows={3} placeholder="About paragraph 1..." />
        </Field>
        <Field label="Paragraph 2">
          <FieldTextarea value={draft.p2 || ''} onChange={(v) => setDraft(d => ({ ...d, p2: v }))} rows={3} placeholder="About paragraph 2..." />
        </Field>
        <Field label="Checkpoints" hint="One per line">
          <FieldTextarea
            value={(draft.checkpoints || []).join('\n')}
            onChange={(v) => setDraft(d => ({ ...d, checkpoints: v.split('\n').filter(Boolean) }))}
            rows={8}
          />
        </Field>
      </EditModal>
    </>
  );
}
