import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/image-upload';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { getDocuments, createDocument, deleteDocument, togglePublishStatus } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { GalleryDoc } from '@/types/admin';
import { fadeUp, staggerContainer } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

const categoryOptions = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'installation', label: 'Installation' },
  { value: 'team', label: 'Team' },
  { value: 'other', label: 'Other' },
];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<GalleryDoc | null>(null);
  const [newImage, setNewImage] = useState({ title: '', category: 'residential', imageUrl: '' });

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    setLoading(true);
    try {
      const data = await getDocuments<GalleryDoc>(COLLECTIONS.GALLERY, [
        orderBy('createdAt', 'desc'),
      ]);
      setImages(data);
    } catch (error) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!newImage.title || !newImage.imageUrl) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const id = await createDocument(COLLECTIONS.GALLERY, {
        ...newImage,
        isPublished: true,
      });
      setImages([{ id, ...newImage, isPublished: true } as GalleryDoc, ...images]);
      setShowAddModal(false);
      setNewImage({ title: '', category: 'residential', imageUrl: '' });
      toast.success('Image added');
    } catch (error) {
      toast.error('Failed to add image');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    try {
      await deleteDocument(COLLECTIONS.GALLERY, deleteConfirm.id);
      setImages((prev) => prev.filter((i) => i.id !== deleteConfirm.id));
      toast.success('Image deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleTogglePublish = async (image: GalleryDoc) => {
    try {
      await togglePublishStatus(COLLECTIONS.GALLERY, image.id!, !image.isPublished);
      setImages((prev) =>
        prev.map((i) =>
          i.id === image.id ? { ...i, isPublished: !i.isPublished } : i
        )
      );
      toast.success(image.isPublished ? 'Image hidden' : 'Image visible');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">Gallery</h2>
          <p className="text-sm text-content-secondary">Manage gallery images</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
          Add Image
        </Button>
      </div>

      {images.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-content-secondary">No images in gallery</p>
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {images.map((image) => (
            <motion.div
              key={image.id}
              variants={fadeUp}
              className="relative group rounded-xl overflow-hidden border border-line bg-surface-card"
            >
              <div className="aspect-square">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleTogglePublish(image)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                >
                  {image.isPublished ? (
                    <EyeOff className="w-5 h-5 text-white" />
                  ) : (
                    <Eye className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setDeleteConfirm(image)}
                  className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-3">
                <p className="font-medium text-sm text-content-primary truncate">{image.title}</p>
                <p className="text-xs text-content-tertiary capitalize">{image.category}</p>
              </div>
              {!image.isPublished && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-yellow-500 text-xs text-white font-medium">
                  Hidden
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-card rounded-2xl shadow-xl max-w-md w-full p-6 border border-line"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-content-primary">Add Image</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-surface-secondary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <Input
                  label="Title"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  placeholder="Image title"
                />
                <Select
                  label="Category"
                  value={newImage.category}
                  onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                  options={categoryOptions}
                />
                <div>
                  <label className="block text-sm font-medium text-content-primary mb-1.5">
                    Image
                  </label>
                  <ImageUpload
                    value={newImage.imageUrl}
                    onChange={(url) => setNewImage({ ...newImage, imageUrl: Array.isArray(url) ? url[0] : url })}
                    folder="gallery"
                  />
                </div>
                <Button onClick={handleAdd} fullWidth>
                  Add to Gallery
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Delete this image from gallery?"
        variant="danger"
      />
    </motion.div>
  );
}
