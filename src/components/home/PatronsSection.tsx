'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Heart } from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';
import { getPatrons } from '@/lib/firestore/content';
import type { Patron } from '@/lib/types';

export function PatronsSection() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await getPatrons();
        setPatrons(list.filter(p => p.enabled).slice(0, 3));
      } catch (err) {
        console.error('Failed to load patrons for homepage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!loading && patrons.length === 0) return null;

  return (
    <section className="py-20 bg-[#07070d] border-t border-zinc-800/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-4">
            <Trophy className="h-6 w-6 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Top Supporters</h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
            A massive thank you to our supporters who help keep NightmareMC running and thriving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {patrons.map((patron, i) => (
            <div
              key={patron.id}
              className={`bg-[#0d0d14] border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all hover:border-purple-500/40 ${
                i === 0
                  ? 'md:-translate-y-3 shadow-[0_0_30px_rgba(234,179,8,0.12)] border-yellow-500/30'
                  : ''
              }`}
            >
              {i === 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-600" />
              )}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden mb-4 bg-zinc-900 border-2 border-zinc-800 ring-2 ring-purple-500/20">
                <SafeImage src={patron.avatarUrl} alt={patron.username} fill />
              </div>
              <h3 className="text-base font-bold text-white mb-0.5">{patron.username}</h3>
              {patron.tier && (
                <span className="text-xs text-purple-400 font-medium mb-1">{patron.tier}</span>
              )}
              {patron.amount && (
                <div className="text-sm font-black text-zinc-300">{patron.amount}</div>
              )}
              <div className="mt-4 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                Rank #{i + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/patrons"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            VIEW ALL PATRONS <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
