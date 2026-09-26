import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import type { SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../utils';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'site');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...DEFAULT_SITE_SETTINGS, ...(docSnap.data() as SiteSettings) });
      } else {
        setSettings(DEFAULT_SITE_SETTINGS);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching site settings:", err);
      setError(err as Error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading, error };
}
