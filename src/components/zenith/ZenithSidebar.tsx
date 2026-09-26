'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Crown, 
  Trophy, 
  Target, 
  ChevronRight, 
  Sparkles,
  Users
} from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { getPatrons } from '@/lib/firestore/content';
import { getCategories } from '@/lib/firestore/categories';
import type { Patron, Category } from '@/lib/types';

interface ZenithSidebarProps {
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

export function ZenithSidebar({ activeCategory, onSelectCategory }: ZenithSidebarProps) {
  const { settings } = useSettingsContext();
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([getPatrons(), getCategories()])
      .then(([pList, cList]) => {
        setPatrons(pList.filter(p => p.enabled));
        setCategories(cList.filter(c => c.enabled));
      })
      .catch(() => {});
  }, []);

  const topPatron = patrons[0] || {
    username: 'CrystalDev',
    amount: '₹5,000',
    tier: 'Diamond Patron',
    avatarUrl: 'https://mc-heads.net/avatar/CrystalDev/64',
  };

  // Mock recent supporters if patrons list is short
  const recentSupporters = patrons.slice(0, 4);

  const goalCurrent = settings.communityGoalCurrent || 7200;
  const goalTarget = settings.communityGoalTarget || 10000;
  const goalPercent = Math.min(100, Math.round((goalCurrent / goalTarget) * 100));

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-4">
      
      {/* 1. STORE MENU (Zenith Golden Card) */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-3xl p-5 shadow-lg shadow-amber-500/15 text-slate-900 overflow-hidden relative group">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wider uppercase">STORE MENU</h3>
              <p className="text-xs font-semibold text-slate-800">
                {categories.length || 6} categories available
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${menuOpen ? 'rotate-90' : ''}`} />
        </div>

        {/* Categories expandable dropdown */}
        {menuOpen && (
          <div className="mt-4 pt-4 border-t border-slate-900/15 space-y-1">
            <button
              onClick={() => onSelectCategory ? onSelectCategory('') : null}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                !activeCategory ? 'bg-slate-900 text-white' : 'hover:bg-black/10 text-slate-900'
              }`}
            >
              All Packages
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory ? onSelectCategory(cat.slug) : null}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeCategory === cat.slug ? 'bg-slate-900 text-white' : 'hover:bg-black/10 text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. TOP DONATOR CARD */}
      <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            TOP DONATOR
          </span>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-black/30 border border-slate-200/70 dark:border-white/5 rounded-2xl p-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-2 ring-amber-400/80 bg-slate-200 dark:bg-zinc-800">
            <img
              src={topPatron.avatarUrl || `https://mc-heads.net/avatar/${topPatron.username}/64`}
              alt={topPatron.username}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/64';
              }}
            />
            <div className="absolute bottom-0 right-0 p-0.5 bg-amber-500 rounded-tl-md">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-900 dark:text-white text-sm truncate">
              {topPatron.username}
            </p>
            <p className="text-xs font-bold text-amber-500 mt-0.5">
              {topPatron.amount}
            </p>
          </div>
        </div>
      </div>

      {/* 3. RECENT SUPPORTERS */}
      <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            RECENT SUPPORTERS
          </span>
        </div>

        <div className="space-y-2.5">
          {recentSupporters.length > 0 ? (
            recentSupporters.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={p.avatarUrl || `https://mc-heads.net/avatar/${p.username}/32`}
                    alt={p.username}
                    className="w-8 h-8 rounded-lg shrink-0 bg-slate-200 dark:bg-zinc-800"
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/32';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {p.username}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                      {p.tier || 'VIP Supporter'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 shrink-0">
                  {p.amount || '₹299'}
                </span>
              </div>
            ))
          ) : (
            // Default demo items matching Zenith mockup
            [
              { name: 'CrystalDev', item: 'VIP Rank', price: '₹699' },
              { name: 'CraftyNode', item: 'Starter Kit', price: '₹149' },
              { name: 'PixelPvPz', item: 'Legendary Key', price: '₹99' },
              { name: 'Redux_X', item: 'Starter Bundle', price: '₹499' },
            ].map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={`https://mc-heads.net/avatar/${p.name}/32`}
                    alt={p.name}
                    className="w-8 h-8 rounded-lg shrink-0 bg-slate-200 dark:bg-zinc-800"
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/32';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                      {p.item}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 shrink-0">
                  {p.price}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. COMMUNITY GOAL (Zenith Progress Bar) */}
      <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              COMMUNITY GOAL
            </span>
          </div>
          <span className="text-sm font-black text-blue-600 dark:text-blue-400">
            {goalPercent}%
          </span>
        </div>

        <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 mb-2">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-1000"
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-bold text-slate-400 dark:text-zinc-500">
          <span>₹{goalCurrent.toLocaleString()}</span>
          <span>Goal: ₹{goalTarget.toLocaleString()}</span>
        </div>
      </div>

    </aside>
  );
}
