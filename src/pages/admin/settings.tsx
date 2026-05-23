import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { SITE_CONFIG } from '@/data/constants';
import { uploadImage } from '@/firebase/storage';
import { Save, Loader2, Upload, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface BrandingSettings {
  siteName: string; tagline: string; description: string;
  phone: string; whatsapp: string; email: string; address: string;
  logoUrl: string; logoUrlDark: string; faviconUrl: string;
  socialLinks: { facebook: string; instagram: string; linkedin: string; twitter: string; youtube: string };
}

const DEFAULTS: BrandingSettings = {
  siteName:    SITE_CONFIG.name,
  tagline:     SITE_CONFIG.tagline,
  description: (SITE_CONFIG as { description?: string }).description ?? '',
  phone:       SITE_CONFIG.phone,
  whatsapp:    SITE_CONFIG.whatsapp,
  email:       SITE_CONFIG.email,
  address:     SITE_CONFIG.address,
  logoUrl: '', logoUrlDark: '', faviconUrl: '',
  socialLinks: { facebook:'', instagram:'', linkedin:'', twitter:'', youtube:'' },
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-content-secondary">{label}</label>
      {hint && <p className="text-xs text-content-tertiary">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-secondary text-content-primary text-sm outline-none focus:border-brand-primary transition-colors placeholder:text-content-tertiary" />
  );
}

function ImageField({
  label, value, onUpload, folder, accept = 'image/png,image/svg+xml,image/webp,image/jpeg,image/x-icon',
}: {
  label: string; value: string; onUpload: (url: string, path: string) => void;
  folder: string; accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setProgress(0); setDone(false);
    try {
      const result = await uploadImage(file, folder, ({ progress: p }) => setProgress(p));
      onUpload(result.url, result.path);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
      toast.success(`${label} updated!`);
    } catch (err: unknown) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="h-20 flex items-center justify-start p-3 bg-surface-secondary rounded-xl border border-line gap-3">
          <img src={value} alt={label} className="h-12 w-auto object-contain rounded" />
          <span className="text-xs text-content-tertiary truncate flex-1">{value.split('/').pop()?.split('?')[0]}</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed transition-colors text-sm cursor-pointer',
          uploading ? 'border-brand-primary/40 opacity-70 pointer-events-none' : 'border-line hover:border-brand-primary text-content-secondary hover:text-brand-primary',
          done && 'border-green-500 text-green-600'
        )}
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading {Math.round(progress)}%</>
        ) : done ? (
          <><Check className="h-4 w-4" /> Uploaded!</>
        ) : (
          <><Upload className="h-4 w-4" /> {value ? 'Replace' : 'Upload'} {label}</>
        )}
      </button>
      {uploading && (
        <div className="h-1 rounded-full bg-surface-secondary overflow-hidden">
          <div className="h-full bg-brand-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      <input ref={ref} type="file" accept={accept} onChange={handle} className="sr-only" />
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<BrandingSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.SETTINGS, 'main'),
      snap => {
        if (snap.exists()) {
          const data = snap.data() as Record<string, unknown>;
          setSettings(prev => ({ ...prev, ...data }));
        }
        setLoaded(true);
      },
      () => setLoaded(true)
    );
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'main'), {
        ...settings,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success('Settings saved!');
    } catch (e: unknown) {
      toast.error('Save failed: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof BrandingSettings) => (value: string) =>
    setSettings(prev => ({ ...prev, [field]: value }));
  const setSocial = (key: keyof BrandingSettings['socialLinks']) => (value: string) =>
    setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
  const setLogo = (field: 'logoUrl' | 'logoUrlDark' | 'faviconUrl') => (url: string) => {
    setSettings(prev => ({ ...prev, [field]: url }));
    // Also update favicon in browser tab immediately
    if (field === 'faviconUrl') {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = url;
    }
  };

  if (!loaded) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>;
  }

  const sectionClass = "bg-surface-card rounded-2xl border border-line p-6 space-y-5";
  const sectionTitle = "text-lg font-bold text-content-primary mb-1";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Site Settings</h1>
          <p className="text-sm text-content-secondary mt-1">All changes sync to the frontend in real time.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary-dark disabled:opacity-60 transition-colors cursor-pointer">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save All'}
        </button>
      </div>

      {/* Branding */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>🏷 Branding</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Company Name"><TextInput value={settings.siteName} onChange={set('siteName')} placeholder="Ashish Enterprises" /></Field>
          <Field label="Tagline"><TextInput value={settings.tagline} onChange={set('tagline')} placeholder="Solar & Electrical" /></Field>
        </div>
        <Field label="Description">
          <textarea value={settings.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="Short company description…"
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-secondary text-content-primary text-sm outline-none focus:border-brand-primary transition-colors resize-vertical placeholder:text-content-tertiary" />
        </Field>
        <div className="grid sm:grid-cols-3 gap-5">
          <Field label="Logo (Light Mode)">
            <ImageField label="Logo" value={settings.logoUrl} onUpload={(url) => setLogo('logoUrl')(url)} folder="logos" />
          </Field>
          <Field label="Logo (Dark/Footer)">
            <ImageField label="Dark Logo" value={settings.logoUrlDark} onUpload={(url) => setLogo('logoUrlDark')(url)} folder="logos" />
          </Field>
          <Field label="Favicon" hint="ICO, PNG, or SVG">
            <ImageField label="Favicon" value={settings.faviconUrl} onUpload={(url) => setLogo('faviconUrl')(url)} folder="logos" accept="image/x-icon,image/png,image/svg+xml,image/vnd.microsoft.icon" />
          </Field>
        </div>
      </div>

      {/* Contact */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>📞 Contact Information</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Phone Number"><TextInput value={settings.phone} onChange={set('phone')} placeholder="+91 8881204444" /></Field>
          <Field label="WhatsApp" hint="Country code without + (e.g. 918881204444)">
            <TextInput value={settings.whatsapp} onChange={set('whatsapp')} placeholder="918881204444" />
          </Field>
          <Field label="Email"><TextInput value={settings.email} onChange={set('email')} type="email" placeholder="info@example.com" /></Field>
        </div>
        <Field label="Address"><TextInput value={settings.address} onChange={set('address')} placeholder="Street, City, State, PIN" /></Field>
      </div>

      {/* Social */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>🔗 Social Media</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {([
            { key: 'facebook',  label: 'Facebook URL' },
            { key: 'instagram', label: 'Instagram URL' },
            { key: 'linkedin',  label: 'LinkedIn URL' },
            { key: 'twitter',   label: 'Twitter/X URL' },
            { key: 'youtube',   label: 'YouTube URL' },
          ] as { key: keyof BrandingSettings['socialLinks']; label: string }[]).map(({ key, label }) => (
            <Field key={key} label={label}>
              <TextInput value={settings.socialLinks[key]} onChange={setSocial(key)} placeholder={`https://${key}.com/...`} />
            </Field>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary-dark disabled:opacity-60 transition-colors cursor-pointer">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
