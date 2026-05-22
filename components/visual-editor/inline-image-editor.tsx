/**
 * InlineImageEditor — click-to-replace image with Firebase Storage upload
 */
import { useRef, useState, type ImgHTMLAttributes, type ChangeEvent } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { uploadImage } from '@/firebase/storage';
import { useVisualEditor } from '@/store/visual-editor-context';
import { cn } from '@/utils/cn';
import { Upload, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface InlineImageEditorProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  onReplace?: (url: string) => void;
  firestorePath?: { collection: string; docId: string; field: string };
  storageFolder?: string;
  className?: string;
  containerClassName?: string;
}

export function InlineImageEditor({ src, alt, onReplace, firestorePath, storageFolder = 'site-images', className, containerClassName, ...imgProps }: InlineImageEditorProps) {
  const { isEditMode } = useVisualEditor();
  const [localSrc, setLocalSrc] = useState(src);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isEditMode) return <img src={localSrc || src} alt={alt} className={className} {...imgProps} />;

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setLocalSrc(preview);
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadImage(file, storageFolder, ({ progress: p }) => setProgress(Math.round(p)));
      if (firestorePath) {
        const { collection, docId, field } = firestorePath;
        await setDoc(doc(db, collection, docId), { [field]: result.url }, { merge: true });
      }
      setLocalSrc(result.url);
      onReplace?.(result.url);
      setDone(true);
      toast.success('Image updated!');
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast.error('Upload failed');
      setLocalSrc(src);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(preview);
      e.target.value = '';
    }
  };

  return (
    <div className={cn('relative group/img cursor-pointer', containerClassName)} onClick={() => !uploading && fileRef.current?.click()}>
      <img src={localSrc || src} alt={alt} className={cn(className, uploading && 'opacity-50')} {...imgProps} />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 group-hover/img:bg-black/50 transition-all duration-200 rounded-[inherit]">
        <div className="opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center gap-2">
          {uploading ? (
            <><Loader2 className="h-7 w-7 text-white animate-spin" /><span className="text-white text-sm font-bold">{progress}%</span></>
          ) : done ? (
            <CheckCircle2 className="h-7 w-7 text-green-400" />
          ) : (
            <><div className="bg-white/10 border border-white/30 rounded-xl p-2.5 backdrop-blur-sm"><Upload className="h-5 w-5 text-white" /></div><span className="text-white text-[11px] font-bold bg-black/60 px-2 py-0.5 rounded">Replace Image</span></>
          )}
        </div>
      </div>
      {uploading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
