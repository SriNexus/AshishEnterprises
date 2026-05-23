/**
 * InlineImageEditor
 * Drop-in replacement for <img> that shows a replace overlay in edit mode.
 * - Renders as a plain <img> for visitors
 * - Shows upload overlay on hover for admins in edit mode
 * - Uploads to Firebase Storage with progress, then saves URL to Firestore
 */
import { useRef, useState, type ImgHTMLAttributes, type ChangeEvent } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { uploadImage } from '@/firebase/storage';
import { useVisualEditor } from '@/store/visual-editor-context';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  onReplace?: (newUrl: string) => void;
  firestorePath?: { collection: string; docId: string; field: string };
  storageFolder?: string;
  containerClassName?: string;
}

export function InlineImageEditor({
  src, alt, onReplace, firestorePath, storageFolder = 'site-images',
  className, containerClassName, ...imgProps
}: Props) {
  const { isEditMode } = useVisualEditor();
  const [displaySrc, setDisplaySrc] = useState(src);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Visitors: plain img, zero editor overhead
  if (!isEditMode) {
    return <img src={src} alt={alt} className={className} {...imgProps} />;
  }

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant preview
    const objectUrl = URL.createObjectURL(file);
    setDisplaySrc(objectUrl);
    setStatus('uploading');
    setProgress(0);

    try {
      const result = await uploadImage(file, storageFolder, ({ progress: p }) => {
        setProgress(Math.round(p));
      });

      // Persist to Firestore if path given
      if (firestorePath) {
        const { collection, docId, field } = firestorePath;
        await setDoc(doc(db, collection, docId), { [field]: result.url }, { merge: true });
      }

      setDisplaySrc(result.url);
      onReplace?.(result.url);
      setStatus('done');
      toast.success('Image updated!');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      toast.error('Upload failed — please try again');
      setDisplaySrc(src);
      setStatus('idle');
    } finally {
      URL.revokeObjectURL(objectUrl);
      e.target.value = '';
    }
  };

  return (
    <div
      className={cn('group/img relative cursor-pointer', containerClassName)}
      onClick={() => status === 'idle' && fileRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
      aria-label={`Replace image: ${alt}`}
    >
      <img
        src={displaySrc}
        alt={alt}
        className={cn(className, status === 'uploading' && 'opacity-60 transition-opacity')}
        {...imgProps}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/45 transition-colors duration-200 rounded-[inherit]">
        <div className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2">
          {status === 'uploading' ? (
            <>
              <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span className="text-white text-xs font-bold">{progress}%</span>
            </>
          ) : status === 'done' ? (
            <span className="text-green-400 text-2xl">✓</span>
          ) : (
            <>
              <div className="bg-black/50 border border-white/30 rounded-xl p-2.5 backdrop-blur-sm">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-white text-[11px] font-bold bg-black/60 px-2 py-0.5 rounded">
                Replace Image
              </span>
            </>
          )}
        </div>
      </div>

      {/* Upload progress bar */}
      {status === 'uploading' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/30">
          <div
            className="h-full bg-amber-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={handleFile}
        className="sr-only"
      />
    </div>
  );
}
