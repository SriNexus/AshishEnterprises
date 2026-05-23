import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, orderBy, query,
} from 'firebase/firestore';
import { deleteFile } from '@/firebase/storage';
import { db } from '@/firebase/config';
import { uploadImage } from '@/firebase/storage';
import { Upload, Trash2, Copy, Check, X, ImageOff, Loader2, Search, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface MediaItem {
  id: string;
  url: string;
  path: string;
  name: string;
  folder: string;
  size?: number;
  type?: string;
  uploadedAt?: { seconds: number } | null;
}

const FOLDERS = ['site-images','logos','hero','gallery','products','projects','blog','about','team'];

function bytes(n?: number) {
  if (!n) return '';
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

export default function AdminMediaPage() {
  const [items, setItems]           = useState<MediaItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [folder, setFolder]         = useState('site-images');
  const [filterFolder, setFilterFolder] = useState('all');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<MediaItem | null>(null);
  const [copied, setCopied]         = useState<string|null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem|null>(null);
  const [deleting, setDeleting]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'media_library'), orderBy('uploadedAt', 'desc'));
    const unsub = onSnapshot(q,
      snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem))); setLoading(false); },
      err  => { console.error('Media library error:', err); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files).slice(0, 10)) {
      try {
        setProgress(0);
        const result = await uploadImage(file, folder, ({ progress: p }) => setProgress(p));
        await addDoc(collection(db, 'media_library'), {
          url:        result.url,
          path:       result.path,
          name:       file.name,
          folder,
          size:       file.size,
          type:       file.type,
          uploadedAt: serverTimestamp(),
        });
        toast.success(`"${file.name}" uploaded`);
      } catch (e: unknown) {
        toast.error(`Failed to upload "${file.name}": ${(e as Error).message}`);
      }
    }
    setUploading(false);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  }, [folder]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.path) await deleteFile(deleteTarget.path);
      await deleteDoc(doc(db, 'media_library', deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(item.id);
      toast.success('URL copied!', { duration: 1500 });
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const visible = items.filter(i => {
    if (filterFolder !== 'all' && i.folder !== filterFolder) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Media Library</h1>
          <p className="text-sm text-content-secondary mt-1">{items.length} files</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
          uploading ? 'border-brand-primary/40 pointer-events-none' : 'border-line hover:border-brand-primary/50 hover:bg-brand-primary/[0.02]'
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            <div className="w-48 h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-content-secondary">Uploading… {Math.round(progress)}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-brand-primary" />
            </div>
            <p className="font-semibold text-content-primary">Drop files here or click to upload</p>
            <p className="text-xs text-content-tertiary">PNG, JPG, WEBP, SVG, GIF · Max 20MB each</p>
            <div className="flex items-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
              <span className="text-xs text-content-tertiary">Save to:</span>
              <select value={folder} onChange={e => setFolder(e.target.value)}
                className="text-xs border border-line rounded-lg px-2 py-1 bg-surface-secondary text-content-primary outline-none focus:border-brand-primary cursor-pointer">
                {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} className="sr-only" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-line bg-surface-card text-sm text-content-primary outline-none focus:border-brand-primary transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', ...FOLDERS].map(f => (
            <button key={f} onClick={() => setFilterFolder(f)}
              className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer',
                filterFolder === f ? 'bg-brand-primary text-white' : 'border border-line text-content-secondary hover:border-brand-primary/30')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20">
          <ImageOff className="h-10 w-10 mx-auto mb-3 text-content-tertiary/30" />
          <p className="text-content-secondary">{search ? 'No files match' : 'No files yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {visible.map(item => (
            <div key={item.id} onClick={() => setSelected(item === selected ? null : item)}
              className={cn('group relative rounded-xl overflow-hidden border cursor-pointer transition-all bg-surface-card',
                selected?.id === item.id ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-line hover:border-brand-primary/30')}>
              <div className="aspect-square bg-surface-secondary overflow-hidden">
                {item.url
                  ? <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  : <ImageOff className="h-8 w-8 m-auto text-content-tertiary/30" />}
              </div>
              <div className="p-2">
                <p className="text-[10px] text-content-secondary font-medium truncate">{item.name}</p>
                <p className="text-[9px] text-content-tertiary capitalize">{item.folder} · {bytes(item.size)}</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                <div className="flex gap-1">
                  <button onClick={() => copyUrl(item)} className="p-1.5 bg-white/90 rounded-lg cursor-pointer">
                    {copied === item.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-zinc-700" />}
                  </button>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/90 rounded-lg cursor-pointer">
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-700" />
                  </a>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 bg-red-500/90 rounded-lg cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed right-0 top-0 bottom-0 w-72 bg-surface-primary border-l border-line shadow-2xl z-50 overflow-y-auto">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h3 className="font-bold text-sm text-content-primary">Details</h3>
            <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-surface-secondary cursor-pointer">
              <X className="h-4 w-4 text-content-secondary" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="aspect-video bg-surface-secondary rounded-xl overflow-hidden">
              <img src={selected.url} alt={selected.name} className="w-full h-full object-contain" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-content-tertiary">Name</span><span className="text-content-primary font-medium truncate ml-2 text-right max-w-[150px]">{selected.name}</span></div>
              <div className="flex justify-between"><span className="text-content-tertiary">Folder</span><span className="text-content-primary capitalize">{selected.folder}</span></div>
              {selected.size && <div className="flex justify-between"><span className="text-content-tertiary">Size</span><span>{bytes(selected.size)}</span></div>}
            </div>
            <div>
              <p className="text-xs text-content-tertiary font-medium mb-1.5">URL</p>
              <div className="flex gap-2">
                <input readOnly value={selected.url} className="flex-1 text-xs bg-surface-secondary border border-line rounded-lg px-2 py-1.5 text-content-secondary outline-none truncate" />
                <button onClick={() => copyUrl(selected)} className="p-1.5 border border-line rounded-lg cursor-pointer">
                  {copied === selected.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-content-secondary" />}
                </button>
              </div>
            </div>
            <button onClick={() => setDeleteTarget(selected)} className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 text-sm hover:bg-red-500/10 transition-colors cursor-pointer flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-surface-primary rounded-2xl border border-line p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-bold text-content-primary mb-2">Delete "{deleteTarget.name}"?</h3>
            <p className="text-sm text-content-secondary mb-6">
              Permanently removes the file from storage. Pages using this image will show a broken image icon.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-line text-sm cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
