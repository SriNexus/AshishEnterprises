import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight, Sun } from 'lucide-react';
import { cn } from '@/utils/cn';
import { NAV_LINKS, SERVICES, SITE_CONFIG } from '@/data/constants';
import { useSite } from '@/store/site-context';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { useTranslation } from '@/hooks/useTranslation';
import { FacebookIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YoutubeIcon } from '@/components/ui/social-icons';

export function Footer() {
  const { ref, inView } = useScrollReveal(0.05);
  const year = new Date().getFullYear();
  const { config, settings } = useSite();
  const { t } = useTranslation();

  const phone = config.phone || SITE_CONFIG.phone;
  const email = config.email || SITE_CONFIG.email;
  const address = config.address || SITE_CONFIG.address;
  const siteName = config.name || SITE_CONFIG.name;
  const description = config.description || SITE_CONFIG.description;
  const social = config.socialLinks || SITE_CONFIG.socialLinks;

  const socialIcons = [
    { Icon: FacebookIcon, href: social.facebook, label: 'Facebook' },
    { Icon: InstagramIcon, href: social.instagram, label: 'Instagram' },
    { Icon: LinkedInIcon, href: social.linkedin, label: 'LinkedIn' },
    { Icon: TwitterIcon, href: social.twitter, label: 'Twitter' },
    { Icon: YoutubeIcon, href: social.youtube, label: 'YouTube' },
  ].filter(s => s.href);

  return (
    <footer className="bg-brand-secondary-dark text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
      <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        <motion.div variants={fadeUp} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className="bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-xl p-2.5"><Sun className="h-8 w-8 text-white" strokeWidth={2.5} /></div>
                <div>
                  <h3 className="text-xl font-bold font-heading">{siteName.split(' ')[0]} <span className="text-brand-primary">{siteName.split(' ').slice(1).join(' ')}</span></h3>
                  <p className="text-xs text-white/50 tracking-widest uppercase">{config.tagline || SITE_CONFIG.tagline}</p>
                </div>
              </>
            )}
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <p className="text-sm text-white/70">{t.footer.newsletter}</p>
            <div className="flex w-full sm:w-auto">
              <input type="email" placeholder={t.forms.email} className="flex-1 sm:w-64 px-4 py-2.5 rounded-l-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-primary transition-colors" />
              <button className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-dark rounded-r-xl text-sm font-semibold transition-colors cursor-pointer"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-4">{t.footer.aboutUs}</h4>
            <p className="text-sm text-white/60 leading-relaxed mb-6">{description}</p>
            {socialIcons.length > 0 && (
              <div className="flex gap-3">
                {socialIcons.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="p-2 rounded-lg bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary transition-all duration-200"><Icon /></a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}><Link to={link.href} className="text-sm text-white/60 hover:text-brand-primary transition-colors flex items-center gap-2 group"><ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />{link.label}</Link></li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-4">{t.footer.services}</h4>
            <ul className="space-y-3">
              {SERVICES.slice(0, 5).map((service) => (
                <li key={service.id}><Link to={`/services/${service.id}`} className="text-sm text-white/60 hover:text-brand-primary transition-colors flex items-center gap-2 group"><ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />{service.title}</Link></li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-4">{t.footer.contactUs}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60"><MapPin className="h-4 w-4 text-brand-primary mt-0.5 flex-shrink-0" /><span>{address}</span></li>
              <li><a href={`tel:${phone}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-brand-primary transition-colors"><Phone className="h-4 w-4 text-brand-primary flex-shrink-0" />{phone}</a></li>
              <li><a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-brand-primary transition-colors"><Mail className="h-4 w-4 text-brand-primary flex-shrink-0" />{email}</a></li>
            </ul>
          </motion.div>
        </div>

        <motion.div variants={fadeUp} className={cn('pt-8 border-t border-white/10', 'flex flex-col sm:flex-row items-center justify-between gap-4')}>
          <p className="text-xs text-white/40">© {year} {siteName}. {t.footer.rights}</p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link to="/privacy-policy" className="hover:text-white/70 transition-colors">{t.footer.privacy}</Link>
            <Link to="/terms" className="hover:text-white/70 transition-colors">{t.footer.terms}</Link>
            <Link to="/faq" className="hover:text-white/70 transition-colors">{t.faq.badge}</Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
