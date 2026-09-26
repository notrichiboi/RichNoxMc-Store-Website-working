'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getPatrons, getPatronTiers } from '@/lib/firestore/content';
import type { Patron, PatronTier } from '@/lib/types';
import { SafeImage } from '@/components/ui/SafeImage';
import { Heart, Trophy, Crown } from 'lucide-react';

export const dynamic = 'force-dynamic';

function PatronCard({ patron }: { patron: Patron }) {
  return (
    <div className="flex flex-col items-center bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-sm dark:shadow-xl group">
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 mb-3 ring-2 ring-slate-200 dark:ring-white/10 group-hover:ring-blue-500/50 transition-all">
        <SafeImage src={patron.avatarUrl || `https://mc-heads.net/avatar/${patron.username}/64`} alt={patron.username} fill />
      </div>
      <p className="font-black text-slate-900 dark:text-white text-sm truncate max-w-full text-center">
        {patron.username}
      </p>
      {patron.tier && (
        <span className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-bold truncate max-w-full">
          {patron.tier}
        </span>
      )}
      {patron.amount && (
        <span className="mt-1 text-xs font-black text-slate-600 dark:text-zinc-300">
          {patron.amount}
        </span>
      )}
      {patron.badge && (
        <span className="mt-2 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2.5 py-0.5 rounded-full">
          {patron.badge}
        </span>
      )}
    </div>
  );
}

export default function PatronsPage() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [tiers, setTiers] = useState<PatronTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatrons(), getPatronTiers()])
      .then(([p, t]) => {
        setPatrons(p.filter(x => x.enabled));
        setTiers(t.filter(t => t.enabled));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 mb-4 shadow-sm">
            <Heart className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Our Hall of Fame &amp; Patrons
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            A special thanks to these incredible community members whose support keeps NightmareMC online, upgraded, and lag-free! ❤️
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-white dark:bg-[#0e0e18] border border-slate-200 dark:border-white/10 animate-pulse" />
            ))}
          </div>
        ) : patrons.length === 0 ? (
          <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm">
            <Trophy className="h-12 w-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-1">No patrons yet</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              Support the server by purchasing packages from the store to be recognized here!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {tiers.length > 0 ? (
              tiers.map(tier => {
                const tierPatrons = patrons.filter(p => p.tier === tier.name);
                if (tierPatrons.length === 0) return null;
                return (
                  <div key={tier.id}>
                    <div className="flex items-center gap-2 mb-4 px-1">
                      <span className="text-2xl">{tier.icon || '⭐'}</span>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">{tier.name}</h2>
                      <span
                        className="ml-2 text-xs px-2.5 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: `${tier.color || '#3b82f6'}20`, color: tier.color || '#3b82f6' }}
                      >
                        {tierPatrons.length} {tierPatrons.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {tierPatrons.map(patron => (
                        <PatronCard key={patron.id} patron={patron} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {patrons.map(patron => (
                  <PatronCard key={patron.id} patron={patron} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
