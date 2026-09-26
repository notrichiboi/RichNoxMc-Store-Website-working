'use client';

import { useEffect } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';

/**
 * FaviconManager
 * Dynamically updates the browser tab favicon without ever calling DOM removeChild,
 * preventing any React fiber reconciliation crashes during navigation.
 */
export function FaviconManager() {
  const { settings } = useSettingsContext();

  useEffect(() => {
    if (typeof document === 'undefined' || !document.head) return;

    const customUrl = settings?.faviconUrl?.trim();
    const isDefault =
      !customUrl ||
      customUrl === '/favicon.ico' ||
      customUrl === '/favicon.svg' ||
      customUrl === '/favicon.png';

    const targetUrl = !isDefault ? customUrl! : '/favicon.svg';

    try {
      const existingLinks = document.querySelectorAll<HTMLLinkElement>(
        "link[rel*='icon'], link[rel='apple-touch-icon']"
      );

      if (existingLinks.length > 0) {
        existingLinks.forEach(el => {
          el.href = targetUrl;
        });
      } else {
        let link = document.getElementById('nightmaremc-favicon') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.id = 'nightmaremc-favicon';
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = targetUrl;
      }
    } catch {
      // Silently catch any DOM environment issues
    }
  }, [settings?.faviconUrl]);

  return null;
}
