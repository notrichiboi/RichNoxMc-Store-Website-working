'use client';

import React from 'react';
import { Settings, ExternalLink } from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';

export default function MaintenancePage() {
  const { settings } = useSettingsContext();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative h-32 w-32 mx-auto mb-8 animate-pulse">
          <SafeImage src={settings?.logoUrl} alt="Logo" fill />
        </div>
        
        <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-6">
          <Settings className="h-8 w-8 text-purple-500 animate-spin-slow" style={{ animationDuration: '4s' }} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">WE'LL BE RIGHT BACK</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
          {settings?.maintenanceMessage ||
            'The NightmareMC store is currently undergoing scheduled maintenance to bring you exciting new updates. Check our Discord for real-time status.'}
        </p>
        
        <a href={settings?.discordUrl || '#'} target="_blank" rel="noopener noreferrer">
          <Button fullWidth className="bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[0_0_20px_rgba(88,101,242,0.3)] h-12">
            JOIN DISCORD FOR UPDATES <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}
