import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, Search, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/image-upload';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import type { SEOSettingsDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';

const defaultSEO: SEOSettingsDoc = {
  id: 'main',
  defaultTitle: 'Ashish Enterprises | UPNEDA Authorized Solar EPC — Varanasi',
  titleTemplate: '%s | Ashish Enterprises',
  defaultDescription: 'Premium solar installations and electrical solutions for homes and businesses. Save up to 70% on electricity bills.',
  defaultKeywords: ['solar panels', 'solar energy', 'electrical services', 'renewable energy'],
  twitterHandle: '@ashishenterprises',
};

export default function AdminSEOPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ogImage, setOgImage] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const { register, handleSubmit, reset } = useForm<SEOSettingsDoc>({
    defaultValues: defaultSEO,
  });

  useEffect(() => {
    fetchSEO();
  }, []);

  async function fetchSEO() {
    setLoading(true);
    try {
      const docRef = doc(db, COLLECTIONS.SEO_SETTINGS, 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SEOSettingsDoc;
        reset(data);
        setOgImage(data.ogImage || '');
        setKeywords(data.defaultKeywords || []);
      }
    } catch (error) {
      console.error('Failed to fetch SEO settings:', error);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: SEOSettingsDoc) => {
    setSaving(true);
    try {
      const docRef = doc(db, COLLECTIONS.SEO_SETTINGS, 'main');
      await setDoc(docRef, {
        ...data,
        ogImage,
        defaultKeywords: keywords,
        id: 'main',
      });
      toast.success('SEO settings saved');
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput && !keywords.includes(keywordInput)) {
      setKeywords([...keywords, keywordInput]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-content-primary">SEO Settings</h2>
            <p className="text-sm text-content-secondary">Optimize for search engines</p>
          </div>
          <Button type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Meta Tags */}
          <Card padding="lg">
            <h3 className="font-semibold text-content-primary mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-primary" />
              Meta Tags
            </h3>
            <div className="space-y-4">
              <Input label="Default Title" {...register('defaultTitle')} />
              <Input
                label="Title Template"
                placeholder="%s | Site Name"
                {...register('titleTemplate')}
              />
              <Textarea
                label="Default Description"
                placeholder="Site description for search engines..."
                {...register('defaultDescription')}
              />
            </div>
          </Card>

          {/* Keywords */}
          <Card padding="lg">
            <h3 className="font-semibold text-content-primary mb-4">Keywords</h3>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add keyword"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1"
              />
              <Button type="button" onClick={addKeyword}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary text-sm"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="p-0.5 hover:bg-brand-primary/20 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Social Sharing */}
          <Card padding="lg" className="lg:col-span-2">
            <h3 className="font-semibold text-content-primary mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-brand-primary" />
              Social Sharing
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Twitter Handle" placeholder="@username" {...register('twitterHandle')} />
                <Input label="Google Verification" placeholder="Verification code" {...register('googleVerification')} />
                <Input label="Bing Verification" placeholder="Verification code" {...register('bingVerification')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-content-primary mb-1.5">
                  Default OG Image
                </label>
                <p className="text-xs text-content-tertiary mb-2">
                  Recommended: 1200×630px
                </p>
                <ImageUpload
                  value={ogImage}
                  onChange={(url) => setOgImage(Array.isArray(url) ? url[0] : url)}
                  folder="seo"
                />
              </div>
            </div>
          </Card>
        </div>
      </form>
    </motion.div>
  );
}
