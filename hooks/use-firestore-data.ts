import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import type { SettingsDoc, HeroSettingsDoc } from '@/types/admin';

/**
 * Fetch a single settings document with fallback
 */
export function useSettings() {
  const [settings, setSettings] = useState<SettingsDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, COLLECTIONS.SETTINGS, 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SettingsDoc);
        }
      } catch (error) {
        console.warn('Settings fetch failed, using defaults:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return { settings, loading };
}

/**
 * Fetch hero settings
 */
export function useHeroSettings() {
  const [hero, setHero] = useState<HeroSettingsDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const docRef = doc(db, COLLECTIONS.HERO_SETTINGS, 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHero(docSnap.data() as HeroSettingsDoc);
        }
      } catch (error) {
        console.warn('Hero settings fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, []);

  return { hero, loading };
}

/**
 * Generic hook to fetch published documents from a collection
 */
export function usePublishedCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, collectionName),
          where('isPublished', '==', true),
          orderBy('order', 'asc')
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T));
        setData(items);
      } catch (error) {
        // Fallback: try without orderBy (field might not exist)
        try {
          const q2 = query(
            collection(db, collectionName),
            where('isPublished', '==', true)
          );
          const snapshot2 = await getDocs(q2);
          setData(snapshot2.docs.map(d => ({ id: d.id, ...d.data() } as T)));
        } catch {
          console.warn(`Failed to fetch ${collectionName}:`, error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [collectionName]);

  return { data, loading };
}
