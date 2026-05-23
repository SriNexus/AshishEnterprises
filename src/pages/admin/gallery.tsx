import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp, query, orderBy, updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { uploadImage, deleteFileByUrl } from '@/firebase/storage';
import { Upload, Trash2, X, Loader2, ImageOff, Eye, EyeOff, Grid3x3, List } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface GalleryItem {
  id: string;
  imageUrl: string;
  storagePath?: string;
  title: string;
  category: string;
  isPublished: boolean;
  order?: number;
  createdAt?: { seconds: number };
}

const CATEGORIES = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Government', 'Other'];

export default function AdminGalleryPage() {
  const [items, setItems]           = useState<GalleryItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [editItem, setEditItem]     = useState<GalleryItem | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [viewMode, setViewMode]     = useState<'grid'|'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const fileRef = useRef<HTMLInputElement>(null);

  // Live query
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.GALLERY), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
        setLoading(false);
      },
      (err) => {
        console.error('Gallery listener error:', err);
        toast.error('Failed to load gallery');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let uploaded = 0;
    let failed = 0;
    for (const file of Array.from(files)) {
      try {
        setProgress(0);
        const result = await uploadImage(file, 'gallery', ({ progress: p }) => setProgress(p));
        await addDoc(collection(db, COLLECTIONS.GALLERY), {
          imageUrl: result.url,
          storagePath: result.path,
          title: file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          category: 'Residential',
          isPublished: true,
          order: Date.now(),
          createdAt: serverTimestamp(),
        });
        uploaded++;
      } catch (e: unknown) {
        console.error('Upload failed:', e);
        failed++;
      }
    }
    setUploading(false);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
    if (uploaded > 0) toast.success(`${uploaded} photo${uploaded !== 1 ? 's' : ''} uploaded`);
    if (failed > 0)   toast.error(`${failed} upload${failed !== 1 ? 's' : ''} failed`);
  }, []);

  const handleTogglePublish = async (item: GalleryItem) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GALLERY, item.id), { isPublished: !item.isPublished });
      toast.success(item.isPublished ? 'Hidden from site' : 'Published to site');
    } catch { toast.error('Failed to update'); }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.GALLERY, editItem.id), {
        title:       editItem.title,
        category:    editItem.category,
        isPublished: editItem.isPublished,
      });
      setEditItem(null);
      toast.success('Saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.storagePath) await deleteFileByUrl(deleteTarget.imageUrl).catch(() => {});
      await deleteDoc(doc(db, COLLECTIONS.GALLERY, deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const filtered = categoryFilter === 'All'
    ? items
    : items.filter(i => i.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Gallery</h1>
          <p className="text-sm text-content-secondary mt-1">
            {items.length} photos · {items.filter(i => i.isPublished).length} published
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg border border-line text-content-secondary hover:text-brand-primary transition-colors cursor-pointer">
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
          </button>
          <button onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark disabled:opacity-60 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            {uploading ? `Uploading ${Math.round(progress)}%…` : 'Upload Photos'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} className="sr-only" />
        </div>
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
          <div className="h-full bg-brand-primary transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              categoryFilter === cat ? 'bg-brand-primary text-white' : 'border border-line text-content-secondary hover:border-brand-primary/40')}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid / List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-content-tertiary">
          <ImageOff className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No photos yet</p>
          <p className="text-sm mt-1">Click "Upload Photos" to add your first image</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(item => (
            <div key={item.id} className={cn('group relative rounded-xl overflow-hidden border bg-surface-card aspect-square', item.isPublished ? 'border-line' : 'border-dashed border-line/50 opacity-60')}>
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy"
                onError={e => { (e.target as HTMLImageElement).src = ''; }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
                <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] font-medium truncate">{item.title}</p>
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => setEditItem({ ...item })} className="flex-1 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] rounded transition-colors cursor-pointer">Edit</button>
                    <button onClick={() => handleTogglePublish(item)} className="p-1 bg-white/20 hover:bg-white/30 rounded cursor-pointer" title={item.isPublished ? 'Hide' : 'Publish'}>
                      {item.isPublished ? <Eye className="h-3 w-3 text-white" /> : <EyeOff className="h-3 w-3 text-white" />}
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1 bg-red-500/70 hover:bg-red-500 rounded cursor-pointer">
                      <Trash2 className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-surface-card rounded-xl border border-line">
              <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-content-primary truncate">{item.title}</p>
                <p className="text-xs text-content-tertiary">{item.category}</p>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', item.isPublished ? 'bg-green-500/10 text-green-600' : 'bg-surface-secondary text-content-tertiary')}>
                {item.isPublished ? 'Published' : 'Hidden'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setEditItem({ ...item })} className="px-3 py-1.5 rounded-lg border border-line text-xs text-content-secondary hover:text-brand-primary hover:border-brand-primary/30 cursor-pointer">Edit</button>
                <button onClick={() => handleTogglePublish(item)} className="p-1.5 rounded-lg border border-line cursor-pointer">
                  {item.isPublished ? <Eye className="h-3.5 w-3.5 text-content-secondary" /> : <EyeOff className="h-3.5 w-3.5 text-content-secondary" />}
                </button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-500 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditItem(null)} />
          <div className="relative bg-surface-primary rounded-2xl border border-line p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-content-primary">Edit Photo</h3>
              <button onClick={() => setEditItem(null)} className="p-1 rounded-lg hover:bg-surface-secondary cursor-pointer"><X className="h-4 w-4 text-content-secondary" /></button>
            </div>
            <img src={editItem.imageUrl} alt={editItem.title} className="w-full aspect-video object-cover rounded-xl mb-5" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-content-secondary mb-1.5">Title</label>
                <input value={editItem.title} onChange={e => setEditItem(ei => ei && { ...ei, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-secondary text-content-primary text-sm outline-none focus:border-brand-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-content-secondary mb-1.5">Category</label>
                <select value={editItem.category} onChange={e => setEditItem(ei => ei && { ...ei, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-secondary text-content-primary text-sm outline-none focus:border-brand-primary transition-colors cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editItem.isPublished} onChange={e => setEditItem(ei => ei && { ...ei, isPublished: e.target.checked })} className="w-4 h-4 accent-brand-primary" />
                <span className="text-sm text-content-primary">Visible on website</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditItem(null)} className="flex-1 py-2.5 rounded-xl border border-line text-sm font-medium text-content-secondary hover:bg-surface-secondary cursor-pointer">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-dark disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-surface-primary rounded-2xl border border-line p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-bold text-content-primary mb-2">Delete Photo?</h3>
            <p className="text-sm text-content-secondary mb-6">
              "{deleteTarget.title}" will be permanently removed from storage and the gallery.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-line text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
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
