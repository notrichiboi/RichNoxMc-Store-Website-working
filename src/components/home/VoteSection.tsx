'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export function VoteSection() {
  return (
    <section className="py-20 bg-[#111118] border-t border-zinc-800/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Star className="h-4 w-4" /> Earn Free Rewards
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Support the Server by Voting</h2>
            <p className="text-zinc-400 mb-6">
              Vote for NightmareMC daily on various server lists to earn exclusive in-game rewards, crate keys, and currency. It's completely free and helps us grow!
            </p>
            <Link href="/vote" className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-white text-black font-bold hover:bg-zinc-200 transition-colors">
              START VOTING <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <div className="bg-[#0a0a0f] border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center h-40">
              <div className="text-3xl font-black text-white mb-1">5</div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Vote Sites</div>
            </div>
            <div className="bg-[#0a0a0f] border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center h-40 mt-6">
              <div className="text-3xl font-black text-purple-400 mb-1">Daily</div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Rewards</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
