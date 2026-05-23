import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './config';
import type { CollectionName } from './collections';
import type { BaseDocument } from '@/types/admin';

/**
 * Generic function to get a single document
 */
export async function getDocument<T extends BaseDocument>(
  collectionName: CollectionName,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

/**
 * Generic function to get all documents from a collection
 */
export async function getDocuments<T extends BaseDocument>(
  collectionName: CollectionName,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}

/**
 * Get published documents only
 */
export async function getPublishedDocuments<T extends BaseDocument>(
  collectionName: CollectionName,
  additionalConstraints: QueryConstraint[] = []
): Promise<T[]> {
  return getDocuments<T>(collectionName, [
    where('isPublished', '==', true),
    ...additionalConstraints,
  ]);
}

/**
 * Paginated query result
 */
export interface PaginatedResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Get paginated documents
 */
export async function getPaginatedDocuments<T extends BaseDocument>(
  collectionName: CollectionName,
  pageSize: number = 10,
  lastDocument?: DocumentSnapshot,
  constraints: QueryConstraint[] = []
): Promise<PaginatedResult<T>> {
  const collectionRef = collection(db, collectionName);
  
  let q = query(
    collectionRef,
    ...constraints,
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1)
  );
  
  if (lastDocument) {
    q = query(q, startAfter(lastDocument));
  }
  
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  const hasMore = docs.length > pageSize;
  
  if (hasMore) {
    docs.pop(); // Remove the extra document
  }
  
  return {
    data: docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[],
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
}

/**
 * Get collection count
 */
export async function getCollectionCount(
  collectionName: CollectionName,
  constraints: QueryConstraint[] = []
): Promise<number> {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Create a new document
 */
export async function createDocument<T extends DocumentData>(
  collectionName: CollectionName,
  data: T,
  userId?: string
): Promise<string> {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId || null,
  });
  return docRef.id;
}

/**
 * Update an existing document
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: CollectionName,
  docId: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: CollectionName,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

/**
 * Toggle publish status
 */
export async function togglePublishStatus(
  collectionName: CollectionName,
  docId: string,
  isPublished: boolean
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    isPublished,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Search documents by field
 */
export async function searchDocuments<T extends BaseDocument>(
  collectionName: CollectionName,
  field: string,
  searchTerm: string,
  limitCount: number = 20
): Promise<T[]> {
  // Firebase doesn't support full-text search natively
  // This is a simple prefix search - for production, consider Algolia or Elasticsearch
  const collectionRef = collection(db, collectionName);
  const q = query(
    collectionRef,
    where(field, '>=', searchTerm),
    where(field, '<=', searchTerm + '\uf8ff'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}
