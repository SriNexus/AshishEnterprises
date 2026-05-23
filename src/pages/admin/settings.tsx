import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { SITE_CONFIG } from '@/data/constants';
import { uploadImage } from '@/firebase/storage';
import { Save, Globe, Phone, Share2, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logoUrl: string;
  logoUrlDark: string;
  faviconUrl: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  };
}

const DEFAULT: SiteSettings = {
  siteName: SITE_CONFIG.name,
  tagline: SITE_CONFIG.tagline,
  description: SITE_CONFIG.description,
  phone: SITE_CONFIG.phone,
  whatsapp: SITE_CONFIG.whatsapp,
  email: SITE_CONFIG.email,
  address: SITE_CONFIG.address,
  logoUrl: '',
  logoUrlDark: '',
  faviconUrl: '',
  socialLinks: SITE_CONFIG.socialLinks,
};

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-content-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SettingsInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-secondary text-content-primary text-sm outline-none focus:border-brand-primary transition-colors" />
  );
}

function ImageUploadField({ label, currentUrl, onUpload, folder }: { label: string; currentUrl: string; onUpload: (url: string) => void; folder: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, folder, ({ progress: p }) => setProgress(Math.round(p)));
      onUpload(result.url);
      toast.success(`${label} uploaded!`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl border border-line">
          <img src={currentUrl} alt={label} className="h-10 w-auto object-contain rounded" />
          <span className="text-xs text-content-tertiary truncate flex-1">{currentUrl.split('/').pop()}</span>
        </div>
      )}
      <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-line hover:border-brand-primary text-content-secondary hover:text-brand-primary transition-colors cursor-pointer text-sm ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
        <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" onChange={handleFile} className="hidden" />
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading {progress}%</> : <><ImageIcon className="h-4 w-4" /> {currentUrl ? 'Replace' : 'Upload'} {label}</>}
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, COLLECTIONS.SETTINGS, 'main'), (snap) => {
      if (snap.exists()) setSettings({ ...DEFAULT, ...snap.data() as SiteSettings });
      setLoaded(true);
    }, () => setLoaded(true));
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'main'), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      toast.success('Settings saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const set = (field: keyof SiteSettings) => (v: string) => setSettings(s => ({ ...s, [field]: v }));
  const setSocial = (key: keyof SiteSettings['socialLinks']) => (v: string) =>
    setSettings(s => ({ ...s, socialLinks: { ...s.socialLinks, [key]: v } }));

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Site Settings</h1>
          <p className="text-sm text-content-secondary mt-1">Manage all global site configuration from here.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark disabled:opacity-60 transition-colors cursor-pointer">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>

      {/* Branding */}
      <div className="bg-surface-card rounded-2xl border border-line p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-content-primary">Branding</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <SettingsField label="Company Name">
            <SettingsInput value={settings.siteName} onChange={set('siteName')} placeholder="Ashish Enterprises" />
          </SettingsField>
          <SettingsField label="Tagline">
            <SettingsInput value={settings.tagline} onChange={set('tagline')} placeholder="Solar & Electrical" />
          </SettingsField>
        </div>
        <SettingsField label="Company Description">
          <textarea value={settings.description} onChange={e => set('description')(e.target.value)} rows={3}
            placeholder="Short company description..." className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-secondary text-content-primary text-sm outline-none focus:border-brand-primary transition-colors resize-vertical" />
        </SettingsField>
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-content-secondary">Logo (Light Mode)</label>
            <ImageUploadField label="Logo" currentUrl={settings.logoUrl} onUpload={(url) => setSettings(s => ({ ...s, logoUrl: url }))} folder="logos" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-content-secondary">Logo (Dark/Footer)</label>
            <ImageUploadField label="Dark Logo" currentUrl={settings.logoUrlDark} onUpload={(url) => setSettings(s => ({ ...s, logoUrlDark: url }))} folder="logos" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-content-secondary">Favicon</label>
            <ImageUploadField label="Favicon" currentUrl={settings.faviconUrl} onUpload={(url) => setSettings(s => ({ ...s, faviconUrl: url }))} folder="logos" />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-surface-card rounded-2xl border border-line p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-content-primary">Contact Information</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <SettingsField label="Phone Number">
            <SettingsInput value={settings.phone} onChange={set('phone')} placeholder="+91 88812 04444" />
          </SettingsField>
          <SettingsField label="WhatsApp Number (e.g. 918881204444)">
            <SettingsInput value={settings.whatsapp} onChange={set('whatsapp')} placeholder="918881204444" />
          </SettingsField>
          <SettingsField label="Email Address">
            <SettingsInput value={settings.email} onChange={set('email')} type="email" placeholder="info@example.com" />
          </SettingsField>
        </div>
        <SettingsField label="Office Address">
          <SettingsInput value={settings.address} onChange={set('address')} placeholder="Street, City, State, PIN" />
        </SettingsField>
      </div>

      {/* Social Links */}
      <div className="bg-surface-card rounded-2xl border border-line p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-content-primary">Social Media Links</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {([
            { key: 'facebook', label: 'Facebook URL' },
            { key: 'instagram', label: 'Instagram URL' },
            { key: 'linkedin', label: 'LinkedIn URL' },
            { key: 'twitter', label: 'Twitter/X URL' },
            { key: 'youtube', label: 'YouTube URL' },
          ] as { key: keyof SiteSettings['socialLinks']; label: string }[]).map(({ key, label }) => (
            <SettingsField key={key} label={label}>
              <SettingsInput value={settings.socialLinks[key]} onChange={setSocial(key)} placeholder={`https://${key}.com/...`} />
            </SettingsField>
          ))}
        </div>
      </div>

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
