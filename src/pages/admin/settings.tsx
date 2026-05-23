import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, Globe, Phone, Mail, Clock, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/image-upload';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import type { SettingsDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';

const defaultSettings: SettingsDoc = {
  id: 'main',
  siteName: 'Ashish Enterprises',
  tagline: 'Solar & Electrical Solutions',
  email: 'ashishenterprises0151@gmail.com',
  phone: '+91 98765 43210',
  whatsapp: '918881204444',
  address: 'Lamahi, Lalpur, Varanasi, Uttar Pradesh 221010',
  socialLinks: { facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '' },
  businessHours: 'Mon-Sat: 9AM - 7PM',
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoDarkUrl, setLogoDarkUrl] = useState('');
  const [logoLightUrl, setLogoLightUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  const { register, handleSubmit, reset } = useForm<SettingsDoc>({ defaultValues: defaultSettings });

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SettingsDoc;
        reset(data);
        setLogoUrl(data.logoUrl || '');
        setLogoDarkUrl(data.logoDarkUrl || '');
        setLogoLightUrl(data.logoLightUrl || '');
        setFaviconUrl(data.faviconUrl || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: SettingsDoc) => {
    setSaving(true);
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'main');
      await setDoc(docRef, {
        ...data,
        logoUrl,
        logoDarkUrl,
        logoLightUrl,
        faviconUrl,
        id: 'main',
      });
      toast.success('Settings saved — website will update automatically');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-content-primary">Settings</h2>
            <p className="text-sm text-content-secondary">Manage website settings & branding</p>
          </div>
          <Button type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>Save Changes</Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── Branding ─────────────────────────── */}
          <Card padding="lg" className="lg:col-span-2">
            <h3 className="font-semibold text-content-primary mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-primary" />
              Branding
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-content-primary mb-2">Main Logo</label>
                <p className="text-xs text-content-tertiary mb-2">Used in navbar & general display</p>
                <ImageUpload value={logoUrl} onChange={url => setLogoUrl(Array.isArray(url) ? url[0] : url)} folder="branding" />
                {logoUrl && (
                  <div className="mt-3 p-3 rounded-lg bg-surface-secondary border border-line flex items-center justify-center h-16">
                    <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-content-primary mb-2">Dark Mode Logo</label>
                <p className="text-xs text-content-tertiary mb-2">Optional — used on dark backgrounds</p>
                <ImageUpload value={logoDarkUrl} onChange={url => setLogoDarkUrl(Array.isArray(url) ? url[0] : url)} folder="branding" />
                {logoDarkUrl && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-900 border border-line flex items-center justify-center h-16">
                    <img src={logoDarkUrl} alt="Dark logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-content-primary mb-2">Light Mode Logo</label>
                <p className="text-xs text-content-tertiary mb-2">Optional — used on light backgrounds</p>
                <ImageUpload value={logoLightUrl} onChange={url => setLogoLightUrl(Array.isArray(url) ? url[0] : url)} folder="branding" />
                {logoLightUrl && (
                  <div className="mt-3 p-3 rounded-lg bg-white border border-line flex items-center justify-center h-16">
                    <img src={logoLightUrl} alt="Light logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-content-primary mb-2">Favicon</label>
                <p className="text-xs text-content-tertiary mb-2">Browser tab icon (32×32 recommended)</p>
                <ImageUpload value={faviconUrl} onChange={url => setFaviconUrl(Array.isArray(url) ? url[0] : url)} folder="branding" />
                {faviconUrl && (
                  <div className="mt-3 p-3 rounded-lg bg-surface-secondary border border-line flex items-center justify-center h-16">
                    <img src={faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── Basic Info ────────────────────────── */}
          <Card padding="lg">
            <h3 className="font-semibold text-content-primary mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-primary" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <Input label="Site Name" {...register('siteName')} />
              <Input label="Tagline" {...register('tagline')} />
            </div>
          </Card>

          {/* ── Contact Info ──────────────────────── */}
          <Card padding="lg">
            <h3 className="font-semibold text-content-primary mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-brand-primary" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <Input label="Phone" icon={<Phone className="w-4 h-4" />} {...register('phone')} />
              <Input label="WhatsApp" {...register('whatsapp')} />
              <Input label="Email" type="email" icon={<Mail className="w-4 h-4" />} {...register('email')} />
              <Textarea label="Address" {...register('address')} />
              <Input label="Business Hours" icon={<Clock className="w-4 h-4" />} {...register('businessHours')} />
            </div>
          </Card>

          {/* ── Social Links ─────────────────────── */}
          <Card padding="lg" className="lg:col-span-2">
            <h3 className="font-semibold text-content-primary mb-4">Social Media</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Facebook" placeholder="https://facebook.com/..." {...register('socialLinks.facebook')} />
              <Input label="Instagram" placeholder="https://instagram.com/..." {...register('socialLinks.instagram')} />
              <Input label="LinkedIn" placeholder="https://linkedin.com/..." {...register('socialLinks.linkedin')} />
              <Input label="Twitter / X" placeholder="https://twitter.com/..." {...register('socialLinks.twitter')} />
              <Input label="YouTube" placeholder="https://youtube.com/..." {...register('socialLinks.youtube')} />
            </div>
          </Card>
        </div>
      </form>
    </motion.div>
  );
}
