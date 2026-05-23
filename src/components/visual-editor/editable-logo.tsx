/**
 * EditableLogo
 * Renders the brand logo. In edit mode: click-to-replace with Firebase Storage upload.
 * - Light logo: settings/main.logoUrl
 * - Dark/footer logo: settings/main.logoUrlDark
 * - Favicon: automatically updated when light logo is replaced
 */
import { useRef, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { uploadImage } from '@/firebase/storage';
import { useSite } from '@/store/site-context';
import { useVisualEditor } from '@/store/visual-editor-context';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface Props {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** 'footer' uses the dark variant (logoUrlDark) */
  variant?: 'default' | 'footer';
}

const sizes = {
  sm: { icon: 'h-6 w-6', text: 'text-lg', sub: 'text-[9px]', img: 'h-8' },
  md: { icon: 'h-8 w-8', text: 'text-xl', sub: 'text-[10px]', img: 'h-10' },
  lg: { icon: 'h-10 w-10', text: 'text-2xl', sub: 'text-xs', img: 'h-12' },
} as const;

export function EditableLogo({ className, showText = true, size = 'md', variant = 'default' }: Props) {
  const s = sizes[size];
  const { settings, config } = useSite();
  const { isEditMode } = useVisualEditor();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Resolve which logo URL to show
  const rawSettings = settings as Record<string, unknown> | null;
  const logoUrl = variant === 'footer'
    ? ((rawSettings?.logoUrlDark as string) || (rawSettings?.logoUrl as string) || '')
    : ((rawSettings?.logoUrl as string) || '');

  const siteName = config.name || 'Ashish Enterprises';
  const tagline  = config.tagline || 'Solar & Electrical';
  const isFooter = variant === 'footer';

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadImage(file, 'logos', ({ progress: p }) => setProgress(Math.round(p)));
      const field = variant === 'footer' ? 'logoUrlDark' : 'logoUrl';
      const update: Record<string, string> = { [field]: result.url };
      // Keep favicon in sync with the main light logo
      if (variant !== 'footer') update.faviconUrl = result.url;
      await setDoc(doc(db, 'settings', 'main'), update, { merge: true });
      toast.success(`${variant === 'footer' ? 'Footer logo' : 'Logo'} updated!`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const logoMarkup = logoUrl ? (
    <img src={logoUrl} alt={siteName} className={cn(s.img, 'w-auto object-contain')} />
  ) : (
    <>
      <div className="relative">
        <div className="absolute inset-0 bg-brand-primary/20 rounded-xl blur-lg" />
        <div className="relative bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-xl p-2">
          <Sun className={cn(s.icon, 'text-white')} strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn(s.text, 'font-bold font-heading leading-tight tracking-tight', isFooter ? 'text-white' : 'text-content-primary')}>
            {siteName.split(' ')[0]}{' '}
            <span className="text-brand-primary">{siteName.split(' ').slice(1).join(' ')}</span>
          </span>
          <span className={cn(s.sub, 'font-medium tracking-widest uppercase', isFooter ? 'text-white/50' : 'text-content-tertiary')}>
            {tagline}
          </span>
        </div>
      )}
    </>
  );

  // Non-edit mode: plain link
  if (!isEditMode) {
    return (
      <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
        {logoMarkup}
      </Link>
    );
  }

  // Edit mode: add replace button on hover
  return (
    <div className={cn('flex items-center gap-2.5 relative group/logo', className)}>
      <Link to="/">{logoMarkup}</Link>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        title="Replace logo"
        className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black shadow-lg opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer whitespace-nowrap"
      >
        {uploading
          ? <><Loader2 className="h-3 w-3 animate-spin" /> {progress}%</>
          : '📷 Logo'
        }
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/svg+xml,image/webp,image/jpeg"
        onChange={handleFile}
        className="sr-only"
      />
    </div>
  );
}
