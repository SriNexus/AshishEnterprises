import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { NAV_LINKS, SERVICES, SITE_CONFIG, STRINGS } from '@/data/constants';
import { useSite } from '@/store/site-context';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditableLogo } from '@/components/visual-editor/editable-logo';
import { EditModal, Field, FieldInput, FieldTextarea } from '@/components/visual-editor/edit-modal';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { FacebookIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YoutubeIcon } from '@/components/ui/social-icons';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';

interface FooterContent {
  aboutText: string;
  copyrightText: string;
  newsletterText: string;
  emailPlaceholder: string;
}

const DEFAULT_FOOTER: FooterContent = {
  aboutText: SITE_CONFIG.description,
  copyrightText: 'All rights reserved.',
  newsletterText: STRINGS.footer.newsletter,
  emailPlaceholder: 'Your email address',
};

export function Footer() {
  const { ref, inView } = useScrollReveal(0.05);
  const year = new Date().getFullYear();
  const { config } = useSite();
  const { isEditMode } = useVisualEditor();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<FooterContent>(DEFAULT_FOOTER);
  const [draft, setDraft] = useState<FooterContent>(DEFAULT_FOOTER);

  // Load footer content from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'footer'), (snap) => {
      if (snap.exists()) setContent({ ...DEFAULT_FOOTER, ...snap.data() as FooterContent });
    }, () => {});
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'footer'), draft, { merge: true });
      setContent(draft);
      setEditOpen(false);
      toast.success('Footer saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const phone = config.phone || SITE_CONFIG.phone;
  const email = config.email || SITE_CONFIG.email;
  const address = config.address || SITE_CONFIG.address;
  const siteName = config.name || SITE_CONFIG.name;
  const social = config.socialLinks || SITE_CONFIG.socialLinks;

  const socialIcons = [
    { Icon: FacebookIcon, href: social.facebook, label: 'Facebook' },
    { Icon: InstagramIcon, href: social.instagram, label: 'Instagram' },
    { Icon: LinkedInIcon, href: social.linkedin, label: 'LinkedIn' },
    { Icon: TwitterIcon, href: social.twitter, label: 'Twitter' },
    { Icon: YoutubeIcon, href: social.youtube, label: 'YouTube' },
  ].filter(s => s.href);

  const footerBody = (
    <footer className="bg-brand-secondary-dark text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
      <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Top bar: logo + newsletter */}
        <motion.div variants={fadeUp} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <EditableLogo size="md" variant="footer" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <p className="text-sm text-white/70">{content.newsletterText}</p>
            <div className="flex w-full sm:w-auto">
              <input type="email" placeholder={content.emailPlaceholder}
                className="flex-1 sm:w-64 px-4 py-2.5 rounded-l-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-primary transition-colors" />
              <button className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-dark rounded-r-xl text-sm font-semibold transition-colors cursor-pointer">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-4">{STRINGS.footer.aboutUs}</h4>
            <p className="text-sm text-white/60 leading-relaxed mb-6">{content.aboutText}</p>
            {socialIcons.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {socialIcons.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="p-2 rounded-lg bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary transition-all duration-200">
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-4">{STRINGS.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-brand-primary transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-4">{STRINGS.footer.services}</h4>
            <ul className="space-y-3">
              {SERVICES.slice(0, 5).map((service) => (
                <li key={service.id}>
                  <Link to={`/services/${service.id}`} className="text-sm text-white/60 hover:text-brand-primary transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-4">{STRINGS.footer.contactUs}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="h-4 w-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <span>{address}</span>
              </li>
              <li>
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-brand-primary transition-colors">
                  <Phone className="h-4 w-4 text-brand-primary flex-shrink-0" />{phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-brand-primary transition-colors">
                  <Mail className="h-4 w-4 text-brand-primary flex-shrink-0" />{email}
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div variants={fadeUp} className={cn('pt-8 border-t border-white/10', 'flex flex-col sm:flex-row items-center justify-between gap-4')}>
          <p className="text-xs text-white/40">© {year} {siteName}. {content.copyrightText}</p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link to="/privacy-policy" className="hover:text-white/70 transition-colors">{STRINGS.footer.privacy}</Link>
            <Link to="/terms" className="hover:text-white/70 transition-colors">{STRINGS.footer.terms}</Link>
            <Link to="/faq" className="hover:text-white/70 transition-colors">FAQ</Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );

  if (!isEditMode) return footerBody;

  return (
    <>
      <EditableSection id="footer" label="Footer" onEdit={() => { setDraft({ ...content }); setEditOpen(true); }}>
        {footerBody}
      </EditableSection>
      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Footer" onSave={handleSave} saving={saving} width="md">
        <p className="text-xs text-zinc-400 bg-zinc-800 rounded-lg px-3 py-2">
          💡 Contact details (phone, email, address) and social links are edited in <strong>Settings → Site Config</strong>.
          Footer logo can be replaced by hovering the logo above.
        </p>
        <Field label="About Us Text">
          <FieldTextarea value={draft.aboutText} onChange={(v) => setDraft(d => ({ ...d, aboutText: v }))} rows={3} placeholder="Short company description..." />
        </Field>
        <Field label="Newsletter Text">
          <FieldInput value={draft.newsletterText} onChange={(v) => setDraft(d => ({ ...d, newsletterText: v }))} placeholder="Stay updated with our latest projects" />
        </Field>
        <Field label="Copyright Text" hint="Year is added automatically">
          <FieldInput value={draft.copyrightText} onChange={(v) => setDraft(d => ({ ...d, copyrightText: v }))} placeholder="All rights reserved." />
        </Field>
      </EditModal>
    </>
  );
}
