// Firebase configuration and services
export { default as app, auth, db, storage, analytics } from './config';

// Collections
export { COLLECTIONS, type CollectionName } from './collections';

// Authentication
export {
  signInAdmin,
  signOutAdmin,
  getCurrentUser,
  onAuthChange,
  getAdminUser,
  isAdmin,
} from './auth';

// Firestore operations
export {
  getDocument,
  getDocuments,
  getPublishedDocuments,
  getPaginatedDocuments,
  getCollectionCount,
  createDocument,
  updateDocument,
  deleteDocument,
  togglePublishStatus,
  searchDocuments,
  type PaginatedResult,
} from './firestore';

// Storage operations
export {
  uploadFile,
  uploadImage,
  deleteFile,
  deleteFileByUrl,
  listFiles,
  getImageUrl,
  compressImage,
  type UploadProgress,
  type UploadResult,
} from './storage';
