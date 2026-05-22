import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from './config';
import imageCompression from 'browser-image-compression';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string;
  path: string;
  name: string;
}

/**
 * Compress image before upload (skip SVGs and non-images)
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> {
  // Skip compression for SVGs, videos, and small files
  if (
    file.type === 'image/svg+xml' ||
    file.type.startsWith('video/') ||
    file.size < 100 * 1024 // < 100KB
  ) {
    return file;
  }

  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    return await imageCompression(file, { maxSizeMB, maxWidthOrHeight, useWebWorker: true });
  } catch (error) {
    console.warn('Image compression skipped:', error);
    return file;
  }
}

/**
 * Upload a file to Firebase Storage with progress tracking
 */
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, path);
      const metadata = { contentType: file.type || 'application/octet-stream' };
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url, path, name: file.name });
        } catch (error) {
          reject(error);
        }
      }
    );
    } catch (error) {
      console.error('Storage init error:', error);
      reject(error);
    }
  });
}

/**
 * Upload an image with compression
 */
export async function uploadImage(
  file: File,
  folder: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Compress raster images
  const processedFile = await compressImage(file);

  // Generate unique filename
  const timestamp = Date.now();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 40);
  const path = `${folder}/${timestamp}_${cleanName}.${ext}`;

  return uploadFile(processedFile, path, onProgress);
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Delete failed (file may not exist):', error);
  }
}

/**
 * Delete file by its download URL
 */
export async function deleteFileByUrl(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Delete by URL failed:', error);
  }
}

/**
 * List all files in a folder
 */
export async function listFiles(folder: string): Promise<UploadResult[]> {
  const storageRef = ref(storage, folder);
  const result = await listAll(storageRef);
  return Promise.all(
    result.items.map(async (item) => ({
      url: await getDownloadURL(item),
      path: item.fullPath,
      name: item.name,
    }))
  );
}

/**
 * Get image URL from path
 */
export async function getImageUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}
