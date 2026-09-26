'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { Button } from '../ui/Button';

export function DiscordSection() {
  const { settings } = useSettingsContext();

  return (
    <section className="py-20 bg-[#0a0a0f]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#5865F2]/10 to-[#5865F2]/5 border border-[#5865F2]/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          
          <div className="absolute -right-20 -top-20 opacity-10">
            <MessageSquare className="w-96 h-96 text-[#5865F2]" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Community</h2>
              <p className="text-zinc-300 max-w-xl mb-6">
                Connect with thousands of other players, participate in exclusive giveaways, get real-time support, and stay updated with the latest server news.
              </p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111118] bg-zinc-800" />
                  ))}
                </div>
                <div className="text-sm text-zinc-400">
                  <strong className="text-white">1,200+</strong> members online
                </div>
              </div>
            </div>

            <a href={settings?.discordUrl || '#'} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[0_0_20px_rgba(88,101,242,0.4)] h-14 px-8 text-lg font-bold">
                <MessageSquare className="mr-2 h-6 w-6" />
                JOIN DISCORD
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
