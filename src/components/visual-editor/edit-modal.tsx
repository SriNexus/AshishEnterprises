/**
 * EditModal — slide-in panel for complex section editing.
 * Animates in from the right. Backdrop click to close, Escape to close.
 */
import { useEffect, useState, type ReactNode, type ChangeEvent } from 'react';
import { X, Save, Loader2, Upload } from 'lucide-react';
import { cn } from '@/utils/cn';
import { uploadImage } from '@/firebase/storage';

/* ─── Modal shell ─────────────────────────────────────────────── */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave?: () => Promise<void> | void;
  saving?: boolean;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

const widthMap = {
  sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl',
};

export function EditModal({ isOpen, onClose, title, children, onSave, saving, width = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex" style={{ zIndex: 9900 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative ml-auto h-full w-full flex flex-col bg-zinc-900 border-l border-zinc-700/60 shadow-2xl',
          widthMap[width]
        )}
        style={{ animation: 'slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700/60 bg-zinc-800/60 backdrop-blur shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-white font-bold text-base">{title}</h2>
            <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full font-bold">EDIT</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {children}
        </div>

        {/* Footer */}
        {onSave && (
          <div className="border-t border-zinc-700/60 bg-zinc-800/60 px-5 py-3.5 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-zinc-500">Saves directly to Firebase</span>
            <div className="flex gap-2.5">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 text-sm font-medium transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-400 text-black text-sm font-bold hover:bg-amber-300 disabled:opacity-60 transition-colors cursor-pointer">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
    </div>
  );
}

/* ─── Field primitives ───────────────────────────────────────── */

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-zinc-300">{label}</label>
      {hint && <p className="text-[11px] text-zinc-500 leading-snug">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-500';

export function FieldInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />;
}

export function FieldTextarea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cn(inputCls, 'resize-vertical')} />;
}

export function FieldSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function FieldNumber({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} className={inputCls} />;
}

export function FieldImageUpload({
  currentUrl, onUpload, folder = 'site-images', label = 'Image',
}: {
  currentUrl?: string; onUpload: (url: string) => void; folder?: string; label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handle = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await uploadImage(file, folder, ({ progress: p }) => setProgress(Math.round(p)));
      onUpload(r.url);
    } finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <div className="h-24 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        </div>
      )}
      <label className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-zinc-600',
        'hover:border-amber-400 text-zinc-400 hover:text-white text-sm transition-colors cursor-pointer',
        uploading && 'opacity-60 pointer-events-none'
      )}>
        <input type="file" accept="image/*,video/*" onChange={handle} className="sr-only" />
        {uploading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading {progress}%</>
          : <><Upload className="h-4 w-4" /> {currentUrl ? 'Replace' : 'Upload'} {label}</>
        }
      </label>
    </div>
  );
}
