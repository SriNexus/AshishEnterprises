import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, Plus, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/image-upload';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import type { HeroSettingsDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';

const defaultHero: HeroSettingsDoc = {
  id: 'main',
  heading: 'Clean Energy,',
  headingAccent: 'Solar',
  subheading: 'Premium solar installations & electrical solutions for homes and businesses. Cut energy costs by up to 70% — backed by a 25-year performance warranty.',
  ctaPrimaryText: 'Get Free Quote',
  ctaPrimaryLink: '/contact',
  ctaSecondaryText: 'Call Now',
  ctaSecondaryLink: 'tel:+918881204444',
  badges: ['Powering 1,800+ homes & businesses'],
  trustChips: [
    { icon: 'Shield', text: '25-Year Warranty' },
    { icon: 'Leaf', text: '70% Savings' },
    { icon: 'Zap', text: 'Free Survey' },
  ],
};

export default function AdminHeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgImage, setBgImage] = useState('');
  const [trustChips, setTrustChips] = useState(defaultHero.trustChips);
  const [chipInput, setChipInput] = useState({ icon: '', text: '' });

  const { register, handleSubmit, reset } = useForm<HeroSettingsDoc>({
    defaultValues: defaultHero,
  });

  useEffect(() => {
    fetchHero();
  }, []);

  async function fetchHero() {
    setLoading(true);
    try {
      const docRef = doc(db, COLLECTIONS.HERO_SETTINGS, 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as HeroSettingsDoc;
        reset(data);
        setBgImage(data.backgroundImage || '');
        setTrustChips(data.trustChips || []);
      }
    } catch (error) {
      console.error('Failed to fetch hero settings:', error);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: HeroSettingsDoc) => {
    setSaving(true);
    try {
      const docRef = doc(db, COLLECTIONS.HERO_SETTINGS, 'main');
      await setDoc(docRef, {
        ...data,
        backgroundImage: bgImage,
        trustChips,
        id: 'main',
      });
      toast.success('Hero settings saved');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save hero settings');
    } finally {
      setSaving(false);
    }
  };

  const addChip = () => {
    if (chipInput.text) {
      setTrustChips([...trustChips, { icon: chipInput.icon || 'Zap', text: chipInput.text }]);
      setChipInput({ icon: '', text: '' });
    }
  };

  const removeChip = (idx: number) => {
    setTrustChips(trustChips.filter((_, i) => i !== idx));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-content-primary">Hero Section</h2>
            <p className="text-sm text-content-secondary">Manage the homepage hero content</p>
          </div>
          <Button type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>Save Changes</Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Text Content */}
          <Card padding="lg">
            <h3 className="font-semibold text-content-primary mb-4">Text Content</h3>
            <div className="space-y-4">
              <Input label="Heading Line 1" placeholder="Clean Energy," {...register('heading')} />
              <Input label="Accent Word" placeholder="Solar" {...register('headingAccent')} />
              <div>
                <label className="block text-sm font-medium text-content-primary mb-1.5">Subheading</label>
                <textarea className="w-full rounded-xl border border-line bg-surface-primary px-4 py-3 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none resize-none" rows={3} placeholder="Premium solar installations..." {...register('subheading')} />
              </div>
            </div>
          </Card>

          {/* CTA Buttons */}
          <Card padding="lg">
            <h3 className="font-semibold text-content-primary mb-4">CTA Buttons</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Primary Button Text" {...register('ctaPrimaryText')} />
                <Input label="Primary Button Link" {...register('ctaPrimaryLink')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Secondary Button Text" {...register('ctaSecondaryText')} />
                <Input label="Secondary Button Link" {...register('ctaSecondaryLink')} />
              </div>
            </div>
          </Card>

          {/* Background Image */}
          <Card padding="lg">
            <h3 className="font-semibold text-content-primary mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-primary" /> Background Image
            </h3>
            <ImageUpload
              value={bgImage}
              onChange={(url) => setBgImage(Array.isArray(url) ? url[0] : url)}
              folder="hero"
            />
          </Card>

          {/* Trust Chips */}
          <Card padding="lg">
            <h3 className="font-semibold text-content-primary mb-4">Trust Indicators</h3>
            <div className="space-y-3">
              {trustChips.map((chip, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-surface-secondary">
                  <span className="text-xs font-medium text-content-secondary flex-1">{chip.icon}: {chip.text}</span>
                  <button type="button" onClick={() => removeChip(idx)} className="p-1 hover:bg-red-500/10 rounded cursor-pointer">
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Icon (e.g., Shield)" value={chipInput.icon} onChange={(e) => setChipInput({ ...chipInput, icon: e.target.value })} className="flex-1" />
                <Input placeholder="Text" value={chipInput.text} onChange={(e) => setChipInput({ ...chipInput, text: e.target.value })} className="flex-1" />
                <Button type="button" onClick={addChip} size="sm" icon={<Plus className="w-4 h-4" />}>Add</Button>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </motion.div>
  );
}
