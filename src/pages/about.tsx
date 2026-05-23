import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, TrendingUp, Target, Eye } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { STRINGS } from '@/data/constants';
import { fadeUp, fadeLeft, fadeRight } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { StatsSection } from '@/sections/stats';
import { TestimonialsSection } from '@/sections/testimonials';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { InlineImageEditor } from '@/components/visual-editor/inline-image-editor';
import { EditModal, Field, FieldInput, FieldTextarea } from '@/components/visual-editor/edit-modal';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';

interface AboutPageContent {
  pageTitle: string;
  pageSubtitle: string;
  overviewImageUrl: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  milestones: { year: string; title: string; description: string }[];
}

const DEFAULT_CONTENT: AboutPageContent = {
  pageTitle: 'About Ashish Enterprises',
  pageSubtitle: 'UPNEDA authorized solar EPC company serving Varanasi & Eastern UP since 2016.',
  overviewImageUrl: '',
  missionTitle: STRINGS.mission.title,
  missionText: STRINGS.mission.content,
  visionTitle: STRINGS.vision.title,
  visionText: STRINGS.vision.content,
  milestones: [
    { year: '2016', title: 'Company Founded', description: 'Started solar energy services in Varanasi' },
    { year: '2018', title: 'UPNEDA Empanelment', description: 'Authorized as EPC vendor by Uttar Pradesh government' },
    { year: '2020', title: '100+ Installations', description: 'Completed 100+ solar installations in Varanasi region' },
    { year: '2022', title: 'PM Surya Ghar Partner', description: 'Authorized installer for PM Surya Ghar Yojana' },
    { year: '2023', title: '500+ Happy Families', description: 'Connected 500+ families with solar energy' },
    { year: '2024', title: 'Regional Expansion', description: 'Expanded services to Jaunpur, Mirzapur & Chandauli' },
  ],
};

export default function AboutPage() {
  const { ref: timelineRef, inView: timelineInView } = useScrollReveal();
  const { isEditMode } = useVisualEditor();
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_CONTENT);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<AboutPageContent>(DEFAULT_CONTENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'about_page'), (snap) => {
      if (snap.exists()) setContent({ ...DEFAULT_CONTENT, ...snap.data() as AboutPageContent });
    }, () => {});
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'about_page'), draft, { merge: true });
      setContent(draft);
      setEditOpen(false);
      toast.success('About page saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const highlights = [
    { icon: Award, label: 'ISO 9001:2015 Certified', description: 'Quality management system certified' },
    { icon: Users, label: '50+ Expert Team', description: 'Certified engineers & technicians' },
    { icon: TrendingUp, label: '99.5% Satisfaction', description: 'Industry-leading customer satisfaction' },
  ];

  return (
    <>
      <MainLayout>
        <PageHero title={content.pageTitle} subtitle={content.pageSubtitle} breadcrumbs={[{ label: 'About Us' }]} />

        <EditableSection id="about-overview" label="Company Overview" onEdit={() => { setDraft({ ...content }); setEditOpen(true); }}>
          <Section background="primary" padding="lg">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-brand-secondary to-brand-secondary-dark">
                  {content.overviewImageUrl ? (
                    <InlineImageEditor src={content.overviewImageUrl} alt="About us"
                      className="w-full h-full object-cover" containerClassName="w-full h-full"
                      onReplace={async (url) => {
                        await setDoc(doc(db, 'settings', 'about_page'), { overviewImageUrl: url }, { merge: true });
                        setContent(c => ({ ...c, overviewImageUrl: url }));
                      }} storageFolder="about" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/30">
                      <div className="w-32 h-32 rounded-full bg-brand-primary/20 flex items-center justify-center text-5xl">☀️</div>
                      {isEditMode && <p className="text-sm">Hover and click Edit to add image</p>}
                    </div>
                  )}
                </div>
              </motion.div>
              <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  {highlights.map(({ icon: Icon, label }) => (
                    <div key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
                      <Icon className="h-4 w-4" />{label}
                    </div>
                  ))}
                </div>
                <p className="text-content-secondary leading-relaxed">{STRINGS.about.p1}</p>
                <p className="text-content-secondary leading-relaxed">{STRINGS.about.p2}</p>
              </motion.div>
            </div>
          </Section>
        </EditableSection>

        <EditableSection id="about-mission" label="Mission & Vision" onEdit={() => { setDraft({ ...content }); setEditOpen(true); }}>
          <Section background="secondary" padding="lg">
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: Target, title: content.missionTitle, text: content.missionText, gradient: 'from-brand-primary/10 to-brand-primary/5', border: 'border-brand-primary/20' },
                { icon: Eye, title: content.visionTitle, text: content.visionText, gradient: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/20' },
              ].map(({ icon: Icon, title, text, gradient, border }) => (
                <motion.div key={title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className={`rounded-2xl bg-gradient-to-br ${gradient} border ${border} p-8`}>
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center mb-5">
                    <Icon className="h-6 w-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-content-primary mb-4">{title}</h3>
                  <p className="text-content-secondary leading-relaxed">{text}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </EditableSection>

        <StatsSection />

        <EditableSection id="about-timeline" label="Company Timeline" onEdit={() => { setDraft({ ...content }); setEditOpen(true); }}>
          <Section background="secondary" padding="lg">
            <SectionHeading badge="Our Journey" title="Milestones That Define Us" />
            <div ref={timelineRef} className="relative max-w-3xl mx-auto">
              <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-line" />
              <div className="space-y-8">
                {content.milestones.map((item, idx) => (
                  <motion.div key={`${item.year}-${idx}`}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative flex gap-6 ${idx % 2 === 0 ? 'sm:flex-row-reverse sm:text-right' : ''}`}>
                    <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-primary/25">
                      {item.year}
                    </div>
                    <div className="flex-1 py-3">
                      <h4 className="font-bold text-content-primary">{item.title}</h4>
                      <p className="text-sm text-content-secondary mt-1">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>
        </EditableSection>

        <TestimonialsSection />
      </MainLayout>

      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit About Page" onSave={handleSave} saving={saving} width="lg">
        <Field label="Page Title">
          <FieldInput value={draft.pageTitle} onChange={v => setDraft(d => ({ ...d, pageTitle: v }))} />
        </Field>
        <Field label="Page Subtitle">
          <FieldTextarea value={draft.pageSubtitle} onChange={v => setDraft(d => ({ ...d, pageSubtitle: v }))} rows={2} />
        </Field>
        <Field label="Mission Title">
          <FieldInput value={draft.missionTitle} onChange={v => setDraft(d => ({ ...d, missionTitle: v }))} />
        </Field>
        <Field label="Mission Text">
          <FieldTextarea value={draft.missionText} onChange={v => setDraft(d => ({ ...d, missionText: v }))} rows={3} />
        </Field>
        <Field label="Vision Title">
          <FieldInput value={draft.visionTitle} onChange={v => setDraft(d => ({ ...d, visionTitle: v }))} />
        </Field>
        <Field label="Vision Text">
          <FieldTextarea value={draft.visionText} onChange={v => setDraft(d => ({ ...d, visionText: v }))} rows={3} />
        </Field>
        <Field label="Timeline Milestones" hint="One per line: YEAR | Title | Description">
          <FieldTextarea
            value={draft.milestones.map(m => `${m.year} | ${m.title} | ${m.description}`).join('\n')}
            onChange={v => {
              const parsed = v.split('\n').filter(Boolean).map(line => {
                const [year, title, ...rest] = line.split('|');
                return { year: year.trim(), title: title.trim(), description: rest.join('|').trim() };
              });
              setDraft(d => ({ ...d, milestones: parsed }));
            }}
            rows={8}
          />
        </Field>
      </EditModal>
    </>
  );
}
