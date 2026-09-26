'use client';

import React from 'react';
import { Target } from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';

export function CommunityGoal() {
  const { settings } = useSettingsContext();

  if (!settings.communityGoalEnabled) return null;

  const current = settings.communityGoalCurrent || 0;
  const target = settings.communityGoalTarget || 1000;
  const currency = settings.communityGoalCurrency || 'INR';
  const symbol = currency === 'INR' ? '₹' : '$';
  const percentage = Math.min(100, Math.max(0, Math.round((current / target) * 100)));

  return (
    <section className="py-12 bg-[#0a0a10] border-y border-zinc-800/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-4">
            <Target className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {settings.communityGoalTitle || 'Monthly Server Goal'}
          </h2>
          <p className="text-zinc-400 mb-6 text-sm max-w-lg leading-relaxed">
            {settings.communityGoalDescription ||
              'Help us reach our monthly goal to unlock server-wide events and rewards for all players!'}
          </p>

          <div className="w-full max-w-xl">
            <div className="flex justify-between text-sm font-bold text-white mb-2">
              <span className="text-purple-400">
                {symbol}{current.toLocaleString()}
              </span>
              <span className="text-zinc-400">
                Goal: {symbol}{target.toLocaleString()}
              </span>
            </div>

            <div className="h-4 w-full bg-[#111118] rounded-full overflow-hidden border border-zinc-800/80 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(204,51,255,0.4)]"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500">
              <span className="font-semibold text-zinc-400">{percentage}% FUNDED</span>
              <span>MANUALLY TRACKED</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
