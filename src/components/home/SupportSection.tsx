'use client';

import React from 'react';
import Link from 'next/link';
import { LifeBuoy, ExternalLink } from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';

export function SupportSection() {
  const { settings } = useSettingsContext();

  return (
    <section className="py-20 bg-[#0a0a0f] border-t border-zinc-800/50">
      <div className="container mx-auto px-4 text-center">
        <LifeBuoy className="h-12 w-12 text-blue-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Need Assistance?</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
          Having issues with a purchase? Need technical support? Our staff team is ready to help you out. Join our Discord server and create a ticket.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href={settings?.discordUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            OPEN SUPPORT TICKET <ExternalLink className="ml-2 h-4 w-4" />
          </a>
          <Link 
            href="/support"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg border border-zinc-700 text-white font-bold hover:bg-zinc-800 transition-colors w-full sm:w-auto"
          >
            READ FAQ
          </Link>
        </div>
      </div>
    </section>
  );
}
