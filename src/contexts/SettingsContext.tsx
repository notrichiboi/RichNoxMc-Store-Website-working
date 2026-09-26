'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '../lib/hooks/useSettings';
import type { SiteSettings } from '@/lib/types';
import { DEFAULT_SITE_SETTINGS } from '../lib/utils';

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: Error | null;
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  loading: true,
  error: null
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsData = useSettings();

  return (
    <SettingsContext.Provider value={settingsData}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  // Context has a safe default value, no throw needed
  return useContext(SettingsContext);
}
