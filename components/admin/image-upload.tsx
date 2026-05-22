import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, deleteFileByUrl, type UploadProgress } from '@/firebase/storage';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  folder: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  multiple = false,
  maxFiles = 5,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setProgress(0);

      try {
        const uploadPromises = acceptedFiles.slice(0, multiple ? maxFiles - images.length : 1).map(async (file) => {
          const result = await uploadImage(file, folder, (p: UploadProgress) => {
            setProgress(p.progress);
          });
          return result.url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);

        if (multiple) {
          onChange([...images, ...uploadedUrls]);
        } else {
          // Delete old image if replacing
          if (images[0]) {
            await deleteFileByUrl(images[0]).catch(() => {});
          }
          onChange(uploadedUrls[0]);
        }

        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder, images, multiple, maxFiles, onChange]
  );

  const removeImage = async (url: string) => {
    try {
      await deleteFileByUrl(url);
      if (multiple) {
        onChange(images.filter((img) => img !== url));
      } else {
        onChange('');
      }
      toast.success('Image removed');
    } catch (error) {
      console.error('Failed to remove image:', error);
      // Still remove from state even if delete fails
      if (multiple) {
        onChange(images.filter((img) => img !== url));
      } else {
        onChange('');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm'],
    },
    multiple,
    maxFiles: multiple ? maxFiles - images.length : 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading || (multiple && images.length >= maxFiles),
  });

  return (
    <div className={cn('space-y-3', className)}>
      {/* Existing Images */}
      {images.length > 0 && (
        <div className={cn('grid gap-3', multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1')}>
          <AnimatePresence mode="popLayout">
            {images.map((url) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group aspect-video rounded-xl overflow-hidden border border-line bg-surface-secondary"
              >
                <img
                  src={url}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Zone */}
      {(!multiple && images.length === 0) || (multiple && images.length < maxFiles) ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
            isDragActive
              ? 'border-brand-primary bg-brand-primary/5'
              : 'border-line hover:border-brand-primary/50',
            uploading && 'pointer-events-none'
          )}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-primary" />
              <p className="text-sm text-content-secondary">
                Uploading... {Math.round(progress)}%
              </p>
              <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                <div
                  className="h-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto text-content-tertiary mb-2" />
              <p className="text-sm text-content-primary font-medium">
                {isDragActive
                  ? 'Drop the files here'
                  : 'Drag & drop images here, or click to select'}
              </p>
              <p className="text-xs text-content-tertiary mt-1">
                PNG, JPG, JPEG, WebP up to 5MB
              </p>
            </>
          )}
        </div>
      ) : null}

      {/* Empty State */}
      {!uploading && images.length === 0 && (
        <div className="flex items-center justify-center p-4 rounded-xl bg-surface-secondary text-content-tertiary">
          <ImageIcon className="w-5 h-5 mr-2" />
          <span className="text-sm">No images uploaded</span>
        </div>
      )}
    </div>
  );
}
