/**
 * EditModal + Field components for Visual Editor side panels
 */
import { useEffect, useState, type ReactNode, type ChangeEvent } from 'react';
import { X, Save, Loader2, Upload } from 'lucide-react';
import { cn } from '@/utils/cn';
import { uploadImage } from '@/firebase/storage';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave?: () => Promise<void> | void;
  saving?: boolean;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export function EditModal({ isOpen, onClose, title, children, onSave, saving, width = 'lg' }: EditModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-[9999] flex">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative ml-auto h-full w-full bg-zinc-900 border-l border-zinc-700 flex flex-col shadow-2xl overflow-hidden', widthMap[width])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-zinc-800/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-white font-bold text-lg">{title}</h2>
            <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-medium">EDIT MODE</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">{children}</div>
        {onSave && (
          <div className="border-t border-zinc-700 bg-zinc-800/80 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Changes sync to Firebase instantly</span>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 text-sm font-medium transition-colors cursor-pointer">Cancel</button>
              <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-400 text-black text-sm font-bold hover:bg-amber-300 disabled:opacity-60 transition-colors cursor-pointer">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-zinc-300">{label}</label>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      {children}
    </div>
  );
}

export function FieldInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-500" />;
}

export function FieldTextarea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-500 resize-vertical" />;
}

export function FieldSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors cursor-pointer">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function FieldNumber({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors" />;
}

export function FieldImageUpload({ currentUrl, onUpload, folder = 'site-images', label = 'Image' }: { currentUrl?: string; onUpload: (url: string) => void; folder?: string; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, folder, ({ progress: p }) => setProgress(Math.round(p)));
      onUpload(result.url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <div className="relative rounded-lg overflow-hidden h-32 bg-zinc-800">
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        </div>
      )}
      <label className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-zinc-600 hover:border-amber-400 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm', uploading && 'opacity-60 pointer-events-none')}>
        <input type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading {progress}%</> : <><Upload className="h-4 w-4" /> {currentUrl ? 'Replace' : 'Upload'} {label}</>}
      </label>
    </div>
  );
}
