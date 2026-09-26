'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ExternalLink, Gift, Star, Award } from 'lucide-react';
import { getVoteLinks, getVoteRewards, getVoteSettings } from '@/lib/firestore/content';
import type { VoteLink, VoteReward, VoteSettings } from '@/lib/types';
import { useSettingsContext } from '@/contexts/SettingsContext';

export const dynamic = 'force-dynamic';

function VoteLinkCard({ link }: { link: VoteLink }) {
  return (
    <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-sm dark:shadow-xl group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {link.name}
            </h3>
            {link.description && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {link.description}
              </p>
            )}
          </div>
          <span className="text-2xl shrink-0 p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40">
            {link.icon || '🗳️'}
          </span>
        </div>
        {link.reward && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/30 px-3 py-1.5 rounded-xl mb-6">
            <Gift className="h-3.5 w-3.5" />
            <span>Reward: {link.reward}</span>
          </div>
        )}
      </div>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
      >
        <span>VOTE NOW</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export default function VotePage() {
  const { settings } = useSettingsContext();
  const [voteLinks, setVoteLinks] = useState<VoteLink[]>([]);
  const [rewards, setRewards] = useState<VoteReward[]>([]);
  const [voteSettings, setVoteSettings] = useState<VoteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getVoteLinks(),
      getVoteRewards(),
      getVoteSettings(),
    ])
      .then(([links, rews, vs]) => {
        setVoteLinks(links.filter(l => l.enabled));
        setRewards(rews.filter(r => r.enabled));
        setVoteSettings(vs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const enabledLinks = voteLinks.filter(l => l.enabled);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 mb-4 shadow-sm">
            <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            {voteSettings?.title || 'Vote for NightmareMC'}
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            {voteSettings?.description ||
              'Support our Minecraft server by voting daily! Earn crate keys, coins, and special perks in-game.'}
          </p>
        </div>

        {/* Announcement */}
        {voteSettings?.announcementEnabled && voteSettings.announcementTitle && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-3xl p-5 text-center shadow-sm">
            <p className="font-black text-blue-700 dark:text-blue-300 text-sm mb-1">
              {voteSettings.announcementTitle}
            </p>
            {voteSettings.announcementMessage && (
              <p className="text-slate-600 dark:text-zinc-400 text-xs">
                {voteSettings.announcementMessage}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vote Links */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1">
              Voting Sites
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-3xl bg-white dark:bg-[#0e0e18] border border-slate-200 dark:border-white/10 animate-pulse" />
                ))}
              </div>
            ) : enabledLinks.length === 0 ? (
              <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-12 text-center">
                <p className="text-slate-500 dark:text-zinc-400 text-sm">Vote links coming soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enabledLinks.map(link => (
                  <VoteLinkCard key={link.id} link={link} />
                ))}
              </div>
            )}
          </div>

          {/* Voting Rewards */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1">
              Voting Rewards
            </h2>
            <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                ))
              ) : rewards.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-4">Rewards configured by admin.</p>
              ) : (
                rewards.map(reward => (
                  <div key={reward.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5">
                    <span className="text-lg shrink-0">{reward.icon || '🎁'}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{reward.name}</p>
                      {reward.description && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{reward.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 shadow-sm flex items-start gap-3">
              <Award className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-0.5">Top Voter Bonus</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  The player with the most votes each month earns a free rank upgrade and exclusive rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
