/**
 * HeroSection — Visual Editor Version
 * All content is editable inline when admin is in edit mode.
 * Saves directly to Firestore hero_settings/main
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Leaf, Phone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput } from '@/components/visual-editor/edit-modal';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { uploadImage } from '@/firebase/storage';
import type { HeroSettingsDoc } from '@/types/admin';
import { STRINGS } from '@/lib/strings';
import toast from 'react-hot-toast';

const DEFAULT_HERO: HeroSettingsDoc = {
  id: 'main',
  heading: 'Solar Powered,',
  headingAccent: 'Brighter',
  subheading: 'Future',
  ctaPrimaryText: 'Get Free Quote',
  ctaPrimaryLink: '/contact',
  ctaSecondaryText: 'Call Now',
  ctaSecondaryLink: 'tel:+918881204444',
  backgroundImage: '/images/hero-scene.jpg',
  badges: ['UPNEDA Authorized · PM Surya Ghar Yojana'],
  trustChips: [
    { icon: 'Shield', text: '25-Year Warranty' },
    { icon: 'Leaf', text: 'Up to 70% Savings' },
    { icon: 'Zap', text: 'Free Site Survey' },
  ],
};


export function HeroSection() {
  const [hero, setHero] = useState<HeroSettingsDoc>(DEFAULT_HERO);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<HeroSettingsDoc>(DEFAULT_HERO);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const docRef = doc(db, COLLECTIONS.HERO_SETTINGS, 'main');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) setHero({ id: 'main', ...snap.data() } as HeroSettingsDoc);
    }, () => {});
    return () => unsub();
  }, []);

  const openEdit = () => { setDraft({ ...hero }); setEditOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, COLLECTIONS.HERO_SETTINGS, 'main'), draft);
      setHero(draft);
      setEditOpen(false);
      toast.success('Hero section saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleBgReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingBg(true);
    try {
      const result = await uploadImage(file, 'hero');
      const updated = { ...hero, backgroundImage: result.url };
      await setDoc(doc(db, COLLECTIONS.HERO_SETTINGS, 'main'), updated);
      setHero(updated);
      toast.success('Background image updated!');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingBg(false); e.target.value = ''; }
  };

  const bgImage = hero.backgroundImage || DEFAULT_HERO.backgroundImage;

  const iconComponents: Record<string, React.ElementType> = { Shield, Leaf, Zap };

  return (
    <>
      <EditableSection
        id="hero"
        label="Hero Section"
        onEdit={openEdit}
        onReplaceImage={() => fileInputRef.current?.click()}
        saving={uploadingBg}
      >
        <section className="relative min-h-[100svh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-[#060a12]" />
          <img src={bgImage} alt="" role="presentation" loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '65% 50%', maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 92%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 92%, transparent 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,10,18,0.93) 0%, rgba(6,10,18,0.88) 20%, rgba(6,10,18,0.65) 38%, rgba(6,10,18,0.25) 52%, transparent 62%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(6,10,18,0.4) 0%, transparent 30%, transparent 75%, rgba(6,10,18,0.5) 100%)' }} />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28 w-full">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center lg:text-left">
                {hero.badges?.[0] && (
                  <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-50" />
                      <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-[11px] text-white/50 font-medium tracking-wide">{hero.badges[0]}</span>
                  </motion.div>
                )}

                <motion.h1 variants={fadeUp} className="font-heading font-extrabold tracking-[-0.03em] text-[2.5rem] leading-[1.06] sm:text-[3.1rem] lg:text-[3.4rem] xl:text-[3.8rem]">
                  <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">{hero.heading}</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#FF8A00] via-amber-300 to-[#FF8A00] bg-clip-text text-transparent">{hero.headingAccent}</span>
                  <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"> {hero.subheading}</span>
                </motion.h1>

                <motion.div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-[#FF8A00] to-amber-400/40 mt-4 mx-auto lg:mx-0"
                  initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />

                <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                  <Link to={hero.ctaPrimaryLink || '/contact'}>
                    <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right" className="shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-shadow">
                      {hero.ctaPrimaryText || STRINGS.hero.cta1}
                    </Button>
                  </Link>
                  <a href={hero.ctaSecondaryLink || 'tel:+918881204444'}>
                    <Button size="lg" variant="ghost" className="text-white/50 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]" icon={<Phone className="h-4 w-4" />}>
                      {hero.ctaSecondaryText || STRINGS.hero.cta2}
                    </Button>
                  </a>
                </motion.div>

                {hero.trustChips && hero.trustChips.length > 0 && (
                  <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start">
                    {hero.trustChips.map(({ icon, text }) => {
                      const I = iconComponents[icon] || Zap;
                      return (
                        <span key={text} className="inline-flex items-center gap-1.5 text-[11px] text-white/28 font-medium">
                          <I className="w-3.5 h-3.5 text-brand-primary/50" />{text}
                        </span>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-surface-primary via-surface-primary/60 to-transparent z-10" />
        </section>
      </EditableSection>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBgReplace} className="hidden" />

      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Hero Section" onSave={handleSave} saving={saving} width="lg">
        <Field label="Heading Line 1"><FieldInput value={draft.heading} onChange={(v) => setDraft(d => ({ ...d, heading: v }))} placeholder="Solar Powered," /></Field>
        <Field label="Accent Word (orange)"><FieldInput value={draft.headingAccent} onChange={(v) => setDraft(d => ({ ...d, headingAccent: v }))} placeholder="Brighter" /></Field>
        <Field label="Heading Line 3"><FieldInput value={draft.subheading} onChange={(v) => setDraft(d => ({ ...d, subheading: v }))} placeholder="Future" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Button Text"><FieldInput value={draft.ctaPrimaryText} onChange={(v) => setDraft(d => ({ ...d, ctaPrimaryText: v }))} /></Field>
          <Field label="Primary Button Link"><FieldInput value={draft.ctaPrimaryLink} onChange={(v) => setDraft(d => ({ ...d, ctaPrimaryLink: v }))} /></Field>
          <Field label="Secondary Button Text"><FieldInput value={draft.ctaSecondaryText} onChange={(v) => setDraft(d => ({ ...d, ctaSecondaryText: v }))} /></Field>
          <Field label="Secondary Button Link"><FieldInput value={draft.ctaSecondaryLink} onChange={(v) => setDraft(d => ({ ...d, ctaSecondaryLink: v }))} /></Field>
        </div>
        <Field label="Badge Text"><FieldInput value={draft.badges?.[0] || ''} onChange={(v) => setDraft(d => ({ ...d, badges: [v] }))} placeholder="UPNEDA Authorized · PM Surya Ghar Yojana" /></Field>
      </EditModal>
    </>
  );
}
