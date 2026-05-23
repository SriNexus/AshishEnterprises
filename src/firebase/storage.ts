/**
 * Firebase Storage — Production Upload Pipeline
 *
 * Key decisions:
 * - No imageCompression on SVG/ICO/small files (causes hangs)
 * - Compression has a 15-second timeout guard
 * - Upload has retry logic with exponential back-off
 * - Progress updates are throttled to avoid excessive re-renders
 * - Download URL is always fetched fresh after upload (never cached)
 */
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UploadProgress {
  progress: number;           // 0-100
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string;   // permanent Firebase Storage download URL
  path: string;  // storage path (needed for deletion)
  name: string;  // original filename
}

// ─── File validation ────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif',  'image/svg+xml',
  'image/x-icon', 'image/vnd.microsoft.icon',
];

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

export function validateFile(
  file: File,
  opts?: { maxMB?: number; types?: string[] }
): void {
  const allowed = opts?.types ?? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  const maxMB   = opts?.maxMB ?? 20;

  // Normalise MIME — some browsers report image/jpg not image/jpeg
  const mime = file.type.toLowerCase().replace('image/jpg', 'image/jpeg');

  if (allowed.length && !allowed.includes(mime) && !allowed.includes(file.type)) {
    throw new Error(
      `"${file.name}" has unsupported type (${file.type}). ` +
      `Allowed: PNG, JPG, WEBP, SVG, GIF`
    );
  }
  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(
      `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. ` +
      `Maximum allowed: ${maxMB} MB`
    );
  }
}

// ─── Image compression ──────────────────────────────────────────────────────

/**
 * Attempt to compress a raster image.
 * Returns original file on error or timeout (never hangs the upload).
 */
export async function compressImage(
  file: File,
  maxSizeMB = 1.5,
  maxWidthOrHeight = 2048
): Promise<File> {
  // Skip: SVG, ICO, video, tiny files, non-images
  if (
    file.type === 'image/svg+xml' ||
    file.type.includes('icon') ||
    file.type.startsWith('video/') ||
    !file.type.startsWith('image/') ||
    file.size < 200 * 1024 // < 200 KB — already small
  ) {
    return file;
  }

  try {
    // Dynamic import avoids top-level cost if compression isn't needed
    const imageCompression = (await import('browser-image-compression')).default;

    // 15-second timeout — if compression takes too long, use original
    const compressPromise = imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
    });

    const timeout = new Promise<File>((_, reject) =>
      setTimeout(() => reject(new Error('Compression timeout')), 15_000)
    );

    return await Promise.race([compressPromise, timeout]);
  } catch {
    // Compression failed or timed out — upload the original
    return file;
  }
}

// ─── Unique path generation ─────────────────────────────────────────────────

export function buildStoragePath(file: File, folder: string): string {
  const ts   = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  const ext  = (file.name.split('.').pop() ?? 'bin').toLowerCase().slice(0, 6);
  const stem = file.name
    .replace(/\.[^/.]+$/, '')          // remove extension
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // sanitize
    .replace(/_+/g, '_')              // collapse underscores
    .slice(0, 40);
  return `${folder.replace(/^\/|\/$/g, '')}/${ts}_${rand}_${stem}.${ext}`;
}

// ─── Core upload ─────────────────────────────────────────────────────────────

/**
 * Upload a single file to Firebase Storage.
 * Returns the permanent download URL.
 */
function uploadFile(
  blob: File | Blob,
  storagePath: string,
  mimeType: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath);
    const metadata   = { contentType: mimeType };
    const task       = uploadBytesResumable(storageRef, blob, metadata);

    let lastProgress = -1;

    task.on(
      'state_changed',
      (snap) => {
        const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        // Throttle: only fire callback when progress changes by at least 1%
        if (onProgress && p !== lastProgress) {
          lastProgress = p;
          onProgress({
            progress: p,
            bytesTransferred: snap.bytesTransferred,
            totalBytes: snap.totalBytes,
          });
        }
      },
      (error) => reject(error),
      async () => {
        try {
          // Always fetch a fresh download URL from the completed task
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

// ─── Upload with retry ───────────────────────────────────────────────────────

async function uploadWithRetry(
  blob: File | Blob,
  storagePath: string,
  mimeType: string,
  onProgress?: (p: UploadProgress) => void,
  attempt = 1,
  maxAttempts = 3,
): Promise<string> {
  try {
    return await uploadFile(blob, storagePath, mimeType, onProgress);
  } catch (err) {
    if (attempt >= maxAttempts) throw err;
    // Exponential back-off: 1s, 2s
    await new Promise(r => setTimeout(r, 1000 * attempt));
    // Report 0% again so UI shows retry
    onProgress?.({ progress: 0, bytesTransferred: 0, totalBytes: 0 });
    return uploadWithRetry(blob, storagePath, mimeType, onProgress, attempt + 1, maxAttempts);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Primary upload function used everywhere in the app.
 *
 * 1. Validates file type and size
 * 2. Compresses raster images (with timeout guard)
 * 3. Generates a unique storage path
 * 4. Uploads with retry logic
 * 5. Returns { url, path, name }
 */
export async function uploadImage(
  file: File,
  folder: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<UploadResult> {
  // Validate
  validateFile(file, {
    types: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES],
    maxMB: file.type.startsWith('video/') ? 200 : 20,
  });

  // Compress raster images
  const blob     = await compressImage(file);
  const mime     = file.type;
  const path     = buildStoragePath(file, folder);

  // Upload
  const url = await uploadWithRetry(blob, path, mime, onProgress);

  return { url, path, name: file.name };
}

/**
 * Delete a file by its storage path.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // Silently ignore — file may already be deleted
  }
}

/**
 * Delete a file by its download URL.
 * Parses the storage path from the URL.
 */
export async function deleteFileByUrl(url: string): Promise<void> {
  if (!url) return;
  try {
    const match = url.match(/\/o\/([^?#]+)/);
    if (match) await deleteFile(decodeURIComponent(match[1]));
  } catch {
    // Ignore
  }
}

/**
 * Replace an existing file: upload new, then delete old asynchronously.
 */
export async function replaceFile(
  newFile: File,
  folder: string,
  oldPath?: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<UploadResult> {
  const result = await uploadImage(newFile, folder, onProgress);
  if (oldPath) {
    // Non-blocking — don't wait for old file deletion
    deleteFile(oldPath).catch(() => {});
  }
  return result;
}
