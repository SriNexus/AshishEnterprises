/**
 * Media Library — /admin/panel/media
 * Full asset manager: upload, preview, copy URL, delete.
 * All files stored in Firebase Storage, metadata in Firestore (settings/media_library).
 */
import { useState, useEffect, useRef } from 'react';
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, orderBy, query,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import { uploadImage, validateFile } from '@/firebase/storage';
import {
  Upload, Trash2, Copy, Check, X, Image as ImageIcon,
  FileImage, Loader2, Search, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

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

const FOLDERS = ['all', 'logos', 'hero', 'gallery', 'products', 'projects', 'blog', 'about', 'team', 'site-images'];

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(ts?: { seconds: number } | null) {
  if (!ts) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFolder, setUploadFolder] = useState('site-images');
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Realtime media library listener
  useEffect(() => {
    const q = query(collection(db, 'media_library'), orderBy('uploadedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = items.filter(item => {
    if (activeFolder !== 'all' && item.folder !== activeFolder) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate
    try { validateFile(file, { maxMB: 20, types: ['image/jpeg','image/png','image/webp','image/svg+xml','image/gif','image/x-icon','image/vnd.microsoft.icon'] }); }
    catch (e: unknown) { toast.error((e as Error).message); return; }

    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadImage(file, uploadFolder, ({ progress }) => setUploadProgress(Math.round(progress)));

      // Save metadata to Firestore
      await addDoc(collection(db, 'media_library'), {
        url: result.url,
        path: result.path,
        name: file.name,
        folder: uploadFolder,
        size: file.size,
        type: file.type,
        uploadedAt: serverTimestamp(),
      });

      toast.success(`"${file.name}" uploaded successfully`);
    } catch (e: unknown) {
      toast.error('Upload failed: ' + (e as Error).message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      // Delete from Storage
      try { await deleteObject(ref(storage, deleteConfirm.path)); } catch {}
      // Delete from Firestore
      await deleteDoc(doc(db, 'media_library', deleteConfirm.id));
      if (selected?.id === deleteConfirm.id) setSelected(null);
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      toast.success('URL copied!', { duration: 1500 });
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Drag & drop
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropRef.current?.classList.add('border-amber-400'); };
  const onDragLeave = () => dropRef.current?.classList.remove('border-amber-400');
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); onDragLeave(); handleFiles(e.dataTransfer.files); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Media Library</h1>
          <p className="text-sm text-content-secondary mt-1">{items.length} files · Drag & drop or click to upload</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        ref={dropRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
          'border-line hover:border-brand-primary/50 hover:bg-brand-primary/[0.02]',
          uploading && 'pointer-events-none opacity-80'
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            <div className="w-48 h-2 bg-surface-tertiary rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-sm text-content-secondary">Uploading… {uploadProgress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
              <Upload className="h-7 w-7 text-brand-primary" />
            </div>
            <div>
              <p className="font-semibold text-content-primary">Click to upload or drag & drop</p>
              <p className="text-xs text-content-tertiary mt-1">PNG, JPG, WEBP, SVG, GIF · Max 20MB</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-content-tertiary">Upload to folder:</span>
              <select
                value={uploadFolder}
                onChange={e => { e.stopPropagation(); setUploadFolder(e.target.value); }}
                onClick={e => e.stopPropagation()}
                className="text-xs border border-line rounded-lg px-2 py-1 bg-surface-secondary text-content-primary outline-none focus:border-brand-primary"
              >
                {FOLDERS.filter(f => f !== 'all').map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,image/x-icon"
          onChange={e => handleFiles(e.target.files)}
          className="sr-only"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            placeholder="Search files…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-line bg-surface-card text-sm text-content-primary outline-none focus:border-brand-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FOLDERS.map(folder => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer',
                activeFolder === folder
                  ? 'bg-brand-primary text-white'
                  : 'bg-surface-card border border-line text-content-secondary hover:border-brand-primary/30'
              )}
            >
              {folder}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ImageIcon className="h-12 w-12 text-content-tertiary/30 mb-4" />
          <p className="text-content-secondary font-medium">{search ? 'No files match your search' : 'No files uploaded yet'}</p>
          <p className="text-sm text-content-tertiary mt-1">Upload your first image above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setSelected(item === selected ? null : item)}
              className={cn(
                'group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-200',
                'bg-surface-card hover:shadow-lg hover:shadow-brand-primary/[0.06]',
                selected?.id === item.id
                  ? 'border-brand-primary ring-2 ring-brand-primary/30'
                  : 'border-line hover:border-brand-primary/30'
              )}
            >
              <div className="aspect-square bg-surface-secondary flex items-center justify-center overflow-hidden">
                {item.url ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <FileImage className="h-8 w-8 text-content-tertiary/40" />
                )}
              </div>
              <div className="p-2">
                <p className="text-[10px] text-content-secondary truncate font-medium">{item.name}</p>
                <p className="text-[9px] text-content-tertiary capitalize">{item.folder} · {formatBytes(item.size)}</p>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => copyUrl(item)} title="Copy URL"
                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors cursor-pointer">
                    {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-zinc-700" />}
                  </button>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" title="Open in new tab"
                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors cursor-pointer">
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-700" />
                  </a>
                  <button onClick={() => setDeleteConfirm(item)} title="Delete"
                    className="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 transition-colors cursor-pointer">
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
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-surface-primary border-l border-line shadow-2xl z-50 overflow-y-auto">
          <div className="p-5 border-b border-line flex items-center justify-between">
            <h3 className="font-bold text-content-primary text-sm">File Details</h3>
            <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer">
              <X className="h-4 w-4 text-content-secondary" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="aspect-video bg-surface-secondary rounded-xl overflow-hidden">
              <img src={selected.url} alt={selected.name} className="w-full h-full object-contain" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-content-tertiary">Name</span>
                <span className="text-content-primary font-medium text-right truncate ml-2">{selected.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-tertiary">Folder</span>
                <span className="text-content-primary capitalize">{selected.folder}</span>
              </div>
              {selected.size && (
                <div className="flex justify-between">
                  <span className="text-content-tertiary">Size</span>
                  <span className="text-content-primary">{formatBytes(selected.size)}</span>
                </div>
              )}
              {selected.uploadedAt && (
                <div className="flex justify-between">
                  <span className="text-content-tertiary">Uploaded</span>
                  <span className="text-content-primary">{formatDate(selected.uploadedAt)}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-content-tertiary font-medium">URL</p>
              <div className="flex gap-2">
                <input readOnly value={selected.url} className="flex-1 text-xs bg-surface-secondary border border-line rounded-lg px-2 py-1.5 text-content-secondary outline-none truncate" />
                <button onClick={() => copyUrl(selected)} className="p-1.5 border border-line rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer">
                  {copiedId === selected.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-content-secondary" />}
                </button>
              </div>
            </div>
            <a href={selected.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-line text-sm text-content-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-colors">
              <ExternalLink className="h-4 w-4" /> Open Full Size
            </a>
            <button onClick={() => setDeleteConfirm(selected)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-500/20 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer">
              <Trash2 className="h-4 w-4" /> Delete File
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-surface-primary rounded-2xl border border-line p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-bold text-content-primary mb-2">Delete "{deleteConfirm.name}"?</h3>
            <p className="text-sm text-content-secondary mb-6">
              This permanently removes the file from Firebase Storage and the media library. Any pages using this image will break.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-line text-sm font-medium text-content-secondary hover:bg-surface-secondary transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
