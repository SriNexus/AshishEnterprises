/**
 * Firebase Storage utilities — production-grade upload system.
 *
 * Features:
 * - File validation (type + size)
 * - Image compression before upload
 * - Unique timestamped filenames (no collisions)
 * - Retry on transient failures (up to 3 attempts)
 * - Upload progress callbacks
 * - Download URL returned after upload
 * - Old file cleanup helper
 */
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';
import imageCompression from 'browser-image-compression';

// ─── Types ─────────────────────────────────────────────────────

export interface UploadProgress {
  progress: number;          // 0-100
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string;   // Firebase Storage download URL (permanent)
  path: string;  // Storage path (for deletion)
  name: string;  // Original filename
}

// ─── Constants ─────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif',  'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon',
];
const ALLOWED_VIDEO_TYPES  = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_MB          = 20;
const MAX_VIDEO_MB          = 200;
const MAX_RETRIES           = 3;

// ─── Validation ────────────────────────────────────────────────

export function validateFile(
  file: File,
  opts?: { maxMB?: number; types?: string[] }
): void {
  const types  = opts?.types ?? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  const maxMB  = opts?.maxMB ?? MAX_IMAGE_MB;

  if (!types.includes(file.type)) {
    throw new Error(`File type "${file.type}" is not supported. Allowed: ${types.join(', ')}`);
  }
  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: ${maxMB}MB`);
  }
}

// ─── Compression ───────────────────────────────────────────────

export async function compressImage(
  file: File,
  maxSizeMB = 1.5,
  maxWidthOrHeight = 2048
): Promise<File> {
  // Don't compress SVGs, videos, tiny files, or non-images
  if (
    file.type === 'image/svg+xml' ||
    file.type.startsWith('video/') ||
    file.size < 150 * 1024 // < 150KB — already small enough
  ) {
    return file;
  }
  if (!file.type.startsWith('image/')) return file;

  try {
    return await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: file.type as 'image/jpeg' | 'image/webp' | 'image/png',
    });
  } catch {
    // If compression fails, just upload original
    return file;
  }
}

// ─── Path generation ───────────────────────────────────────────

function buildPath(file: File, folder: string): string {
  const ts   = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const stem = file.name
    .replace(/\.[^.]+$/, '')          // remove extension
    .replace(/[^a-zA-Z0-9_-]/g, '_') // sanitize
    .slice(0, 48);                    // limit length
  return `${folder}/${ts}_${rand}_${stem}.${ext}`;
}

// ─── Core upload ───────────────────────────────────────────────

function uploadOnce(
  file: File,
  storagePath: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

    task.on(
      'state_changed',
      (snap: UploadTaskSnapshot) => {
        onProgress?.({
          progress: (snap.bytesTransferred / snap.totalBytes) * 100,
          bytesTransferred: snap.bytesTransferred,
          totalBytes: snap.totalBytes,
        });
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

async function uploadWithRetry(
  file: File,
  storagePath: string,
  onProgress?: (p: UploadProgress) => void,
  attempt = 1,
): Promise<string> {
  try {
    return await uploadOnce(file, storagePath, onProgress);
  } catch (err) {
    if (attempt >= MAX_RETRIES) throw err;
    // Exponential back-off: 1s, 2s, 4s
    await new Promise(r => setTimeout(r, 1000 * attempt));
    return uploadWithRetry(file, storagePath, onProgress, attempt + 1);
  }
}

// ─── Public API ────────────────────────────────────────────────

/**
 * Upload any image or video to Firebase Storage.
 * - Validates type & size
 * - Compresses images
 * - Generates unique filename
 * - Retries on failure
 * - Returns permanent download URL
 */
export async function uploadImage(
  file: File,
  folder: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<UploadResult> {
  // Validate
  validateFile(file, {
    types: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES],
    maxMB: file.type.startsWith('video/') ? MAX_VIDEO_MB : MAX_IMAGE_MB,
  });

  // Compress if it's a raster image
  const toUpload = await compressImage(file);

  // Build unique storage path
  const storagePath = buildPath(file, folder);

  // Upload with retry
  const url = await uploadWithRetry(toUpload, storagePath, onProgress);

  return { url, path: storagePath, name: file.name };
}

/**
 * Delete a file from Storage by its storage path.
 * Silent failure — won't throw if file doesn't exist.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // File may already be deleted or path invalid — ignore
  }
}

/**
 * Delete a file by its download URL.
 * Extracts the storage path from the URL.
 */
export async function deleteFileByUrl(url: string): Promise<void> {
  try {
    const match = url.match(/\/o\/([^?]+)/);
    if (match) await deleteFile(decodeURIComponent(match[1]));
  } catch {
    // Ignore
  }
}

/**
 * Replace an existing file: upload new → return URL → delete old (non-blocking).
 */
export async function replaceFile(
  newFile: File,
  folder: string,
  oldPath?: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<UploadResult> {
  const result = await uploadImage(newFile, folder, onProgress);
  if (oldPath) deleteFile(oldPath).catch(() => {});
  return result;
}
