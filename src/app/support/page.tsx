'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useSettingsContext } from '@/contexts/SettingsContext';
import {
  LifeBuoy, ExternalLink, ShoppingCart,
  Cpu, Server, Users, MessageSquare
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const SUPPORT_CATEGORIES = [
  {
    icon: ShoppingCart,
    title: 'Purchase Help',
    description: 'Need help with your order? Our staff confirms orders and payment instructions through Discord tickets.',
    color: '#3b82f6',
  },
  {
    icon: Cpu,
    title: 'Technical Support',
    description: 'Having trouble connecting, experiencing lag, or encountering bugs? We are here to assist.',
    color: '#10b981',
  },
  {
    icon: Server,
    title: 'Server Gameplay',
    description: 'Questions about server mechanics, claims, commands, or events? Ask our community and moderators.',
    color: '#8b5cf6',
  },
  {
    icon: Users,
    title: 'Player Reports',
    description: 'Encountered a rule-breaker or toxic player? Submit an evidence ticket in Discord.',
    color: '#f59e0b',
  },
];

export default function SupportPage() {
  const { settings } = useSettingsContext();

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 mb-4 shadow-sm">
            <LifeBuoy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            How can we help you?
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            All player support, store orders, and ticket assistance are handled through our official Discord server.
          </p>
        </div>

        {/* Discord Primary CTA */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-8 sm:p-10 text-center mb-10 shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Join our Discord Ticket Portal</h2>
            <p className="text-xs sm:text-sm text-blue-100 mb-6 leading-relaxed">
              Our staff team is ready to assist you. Create a ticket in our support channel for immediate assistance.
            </p>
            <a
              href={settings.discordUrl || 'https://discord.gg/nightmaremc'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-lg hover:scale-105"
            >
              <span>OPEN DISCORD TICKET</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Support Categories */}
        <h2 className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-1">
          Support Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUPPORT_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <a
                key={i}
                href={settings.discordUrl || 'https://discord.gg/nightmaremc'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 p-5 bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-sm"
              >
                <div
                  className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                >
                  <Icon className="h-5 w-5" style={{ color: cat.color }} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{cat.description}</p>
                </div>
              </a>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
