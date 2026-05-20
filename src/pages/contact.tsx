import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { SITE_CONFIG, SERVICES } from '@/data/constants';
import { contactFormSchema, type ContactFormSchema } from '@/lib/validations';
import { submitContactForm } from '@/services/contact';
import { fadeUp, fadeLeft, fadeRight, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/ui/social-icons';

const serviceOptions = [
  { value: '', label: 'Select a service' },
  ...SERVICES.map((s) => ({ value: s.id, label: s.title })),
];

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    primary: SITE_CONFIG.phone,
    secondary: 'Mon-Sat 9AM-7PM',
    href: `tel:${SITE_CONFIG.phone}`,
  },
  {
    icon: Mail,
    title: 'Email',
    primary: SITE_CONFIG.email,
    secondary: 'We reply within 24 hours',
    href: `mailto:${SITE_CONFIG.email}`,
  },
  {
    icon: MapPin,
    title: 'Address',
    primary: SITE_CONFIG.address,
    secondary: 'Visit our office',
    href: 'https://maps.google.com',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    primary: 'Mon-Sat: 9AM - 7PM',
    secondary: 'Sunday: By appointment',
    href: null,
  },
];

const socialLinks = [
  { Icon: FacebookIcon, href: SITE_CONFIG.socialLinks.facebook, label: 'Facebook' },
  { Icon: InstagramIcon, href: SITE_CONFIG.socialLinks.instagram, label: 'Instagram' },
  { Icon: LinkedInIcon, href: SITE_CONFIG.socialLinks.linkedin, label: 'LinkedIn' },
  { Icon: TwitterIcon, href: SITE_CONFIG.socialLinks.twitter, label: 'Twitter' },
  { Icon: YoutubeIcon, href: SITE_CONFIG.socialLinks.youtube, label: 'YouTube' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { ref, inView } = useScrollReveal();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormSchema>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', phone: '', service: '', message: '' },
  });

  const onSubmit = async (data: ContactFormSchema) => {
    const result = await submitContactForm(data);
    if (result.success) {
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <MainLayout>
      <PageHero
        title="Contact Us"
        subtitle="Have questions about solar energy? We're here to help. Get in touch with our team."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      {/* Contact Info Cards */}
      <Section background="secondary" padding="md">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {contactInfo.map((item) => {
            const Icon = item.icon;
            const Wrapper = item.href ? 'a' : 'div';
            const wrapperProps = item.href
              ? { href: item.href, target: item.href.startsWith('http') ? '_blank' : undefined, rel: item.href.startsWith('http') ? 'noopener noreferrer' : undefined }
              : {};

            return (
              <motion.div key={item.title} variants={fadeUp}>
                <Wrapper {...wrapperProps}>
                  <Card className={`h-full ${item.href ? 'group cursor-pointer' : ''}`} padding="lg">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-all">
                      <Icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-content-primary mb-1">{item.title}</h3>
                    <p className="text-sm text-content-primary font-medium">{item.primary}</p>
                    <p className="text-xs text-content-tertiary mt-1">{item.secondary}</p>
                  </Card>
                </Wrapper>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      {/* Contact Form & Map */}
      <Section background="primary" padding="lg">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Form */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-content-primary mb-2">
              Send Us a Message
            </h2>
            <p className="text-content-secondary mb-6">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>

            <Card padding="lg">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-content-primary mb-2">Thank You!</h3>
                  <p className="text-content-secondary">
                    Your message has been sent. We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+91 98765 43210"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                    <Select
                      label="Service Required"
                      options={serviceOptions}
                      error={errors.service?.message}
                      {...register('service')}
                    />
                  </div>
                  <Textarea
                    label="Your Message"
                    placeholder="Tell us about your requirements..."
                    error={errors.message?.message}
                    {...register('message')}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    icon={<Send className="h-4 w-4" />}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>

          {/* Map & Quick Actions */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Map Placeholder */}
            <div className="rounded-2xl overflow-hidden border border-line h-72 bg-surface-secondary flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-brand-primary/30 mx-auto mb-3" />
                <p className="text-sm text-content-secondary">
                  Interactive map will be displayed here
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONFIG.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-primary hover:underline mt-2 inline-block"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <Card padding="lg">
              <h3 className="font-bold text-content-primary mb-4">Quick Contact</h3>
              <div className="space-y-3">
                <a href={`tel:${SITE_CONFIG.phone}`}>
                  <Button fullWidth variant="outline" size="lg" icon={<Phone className="h-5 w-5" />}>
                    Call Now: {SITE_CONFIG.phone}
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi! I'm interested in your solar solutions.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button fullWidth size="lg" className="bg-green-500 hover:bg-green-600" icon={<MessageCircle className="h-5 w-5" />}>
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </Card>

            {/* Social Links */}
            <Card padding="lg">
              <h3 className="font-bold text-content-primary mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {socialLinks.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center text-content-secondary hover:bg-brand-primary hover:text-white transition-all"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>
    </MainLayout>
  );
}
