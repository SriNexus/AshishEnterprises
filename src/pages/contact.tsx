import { STRINGS } from '@/lib/strings';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FacebookIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YoutubeIcon } from '@/components/ui/social-icons';
import { SITE_CONFIG, SERVICES } from '@/data/constants';
import { contactFormSchema, type ContactFormSchema } from '@/lib/validations';
import { submitContactForm } from '@/services/contact';
import { fadeLeft, fadeRight } from '@/animations/variants';
import { useSite } from '@/store/site-context';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { config } = useSite();

  const phone = config.phone || SITE_CONFIG.phone;
  const email = config.email || SITE_CONFIG.email;
  const address = config.address || SITE_CONFIG.address;
  const whatsapp = config.whatsapp || SITE_CONFIG.whatsapp;
  const social = config.socialLinks || SITE_CONFIG.socialLinks;

  const serviceOptions = SERVICES.map((s) => ({ value: s.id, label: s.title }));

  const socialLinks = [
    { Icon: FacebookIcon, href: social.facebook, label: 'Facebook' },
    { Icon: InstagramIcon, href: social.instagram, label: 'Instagram' },
    { Icon: LinkedInIcon, href: social.linkedin, label: 'LinkedIn' },
    { Icon: TwitterIcon, href: social.twitter, label: 'Twitter' },
    { Icon: YoutubeIcon, href: social.youtube, label: 'YouTube' },
  ].filter((s) => s.href);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormSchema>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', phone: '', service: '', message: '' },
  });

  const onSubmit = async (data: ContactFormSchema) => {
    const result = await submitContactForm(data);
    if (result.success) { setSubmitted(true); reset(); setTimeout(() => setSubmitted(false), 6000); }
  };

  return (
    <MainLayout>
      <PageHero title={'Contact Us'} subtitle={STRINGS.contact.subtitle} breadcrumbs={[{ label: 'Contact' }]} />

      <Section background="primary" padding="lg">
        <SectionHeading badge={STRINGS.contact.badge} title={STRINGS.contact.title} subtitle={STRINGS.contact.subtitle} />

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
          <motion.div variants={fadeLeft} className="lg:col-span-2 space-y-5">
            {[
              { icon: Phone, title: STRINGS.contact.callUs, value: phone, href: `tel:${phone}`, sub: 'Mon–Sat, 9AM–7PM' },
              { icon: Mail, title: STRINGS.contact.emailUs, value: email, href: `mailto:${email}`, sub: '24h response' },
              { icon: MapPin, title: STRINGS.contact.visitUs, value: address, href: null as string | null, sub: '' },
            ].map(({ icon: Icon, title, value, href, sub }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-2xl bg-surface-secondary border border-line hover:border-brand-primary/20 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0"><Icon className="h-5 w-5 text-brand-primary" /></div>
                <div>
                  <h4 className="text-sm font-semibold text-content-primary">{title}</h4>
                  {href ? <a href={href} className="text-sm text-content-secondary hover:text-brand-primary transition-colors">{value}</a>
                    : <p className="text-sm text-content-secondary">{value}</p>}
                  {sub && <p className="text-xs text-content-tertiary mt-0.5">{sub}</p>}
                </div>
              </div>
            ))}

            <a href={`https://wa.me/${whatsapp}?text=Hi! I'm interested in your solar solutions.`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-5 rounded-2xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-colors group">
              <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0"><MessageCircle className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">{STRINGS.contact.whatsapp}</p>
                <p className="text-xs text-content-secondary">Chat instantly</p>
              </div>
            </a>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white">
              <div className="flex items-center gap-2 mb-3"><Clock className="h-4 w-4 opacity-80" /><h4 className="font-semibold text-sm">{STRINGS.contact.businessHours}</h4></div>
              <div className="space-y-1.5 text-sm text-white/80">
                <div className="flex justify-between"><span>{STRINGS.contact.monSat}</span><span className="font-medium text-white">9 AM – 7 PM</span></div>
                <div className="flex justify-between"><span>{STRINGS.contact.sunday}</span><span className="font-medium text-white">{STRINGS.contact.byAppointment}</span></div>
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                    className="w-10 h-10 rounded-xl border border-line bg-surface-card flex items-center justify-center text-content-tertiary hover:text-brand-primary hover:border-brand-primary/30 transition-all">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}

            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-content-secondary hover:text-brand-primary transition-colors">
              <ExternalLink className="h-4 w-4" /> View on Google Maps
            </a>
          </motion.div>

          <motion.div variants={fadeRight} className="lg:col-span-3">
            <div className="bg-surface-card rounded-3xl border border-line p-6 sm:p-8">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-5"><CheckCircle2 className="h-8 w-8 text-green-500" /></div>
                  <h3 className="text-xl font-bold text-content-primary mb-2">{STRINGS.contact.thankYou}</h3>
                  <p className="text-content-secondary">{STRINGS.contact.thankYouMsg}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input label={STRINGS.forms.name} placeholder="John Doe" error={errors.name?.message} {...register('name')} />
                    <Input label={STRINGS.forms.email} type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input label={STRINGS.forms.phone} type="tel" placeholder="+91 88812 04444" error={errors.phone?.message} {...register('phone')} />
                    <Select label={STRINGS.forms.service} placeholder={STRINGS.forms.selectService} options={serviceOptions} error={errors.service?.message} {...register('service')} />
                  </div>
                  <Textarea label={STRINGS.forms.message} placeholder="Tell us about your requirements..." error={errors.message?.message} {...register('message')} />
                  <Button type="submit" size="lg" fullWidth isLoading={isSubmitting} icon={<Send className="h-4 w-4" />}>{STRINGS.contact.sendMessage}</Button>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a href={`tel:${phone}`} className="flex-1">
                      <Button size="lg" variant="outline" fullWidth icon={<Phone className="h-4 w-4" />}>Call Now: {phone}</Button>
                    </a>
                    <a href={`https://wa.me/${whatsapp}?text=Hi! I'm interested in your solar solutions.`} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="lg" variant="ghost" fullWidth icon={<MessageCircle className="h-4 w-4" />} className="border border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/10">WhatsApp Us</Button>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </Section>
    </MainLayout>
  );
}
