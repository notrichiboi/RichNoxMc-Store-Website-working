'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  HelpCircle, 
  ShieldCheck, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { ProductCard } from '../store/ProductCard';
import type { Product } from '@/lib/types';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface ZenithStoreMainProps {
  products: Product[];
  loading?: boolean;
  categoryTitle?: string;
  onBrowseAll?: () => void;
}

export function ZenithStoreMain({ 
  products, 
  loading = false, 
  categoryTitle = 'Featured Packages',
  onBrowseAll 
}: ZenithStoreMainProps) {
  const { settings } = useSettingsContext();

  return (
    <div className="flex-1 space-y-6 min-w-0">
      
      {/* 1. WELCOME TO STORE BANNER CARD */}
      <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300/40 text-[11px] font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WELCOME TO STORE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
            GEAR UP &amp; DOMINATE THE SERVER
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-6">
            Unlock exclusive ranks, crate keys, survival kits, and coins. Connect with our community and enhance your gameplay today.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
            >
              <span>Browse Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={settings.discordUrl || 'https://discord.gg/nightmaremc'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200/80 dark:border-white/10 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#5865F2]" />
              <span>Discord Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. FEATURED PACKAGES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white uppercase tracking-wider">
              {categoryTitle}
            </h3>
          </div>

          <Link
            href="/store"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
          >
            <span>BROWSE ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-80 bg-white dark:bg-[#0e0e18] border border-slate-200 dark:border-zinc-800 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-1">
              No packages found in this category
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              Check back soon or select another category from the store menu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* 3. HELP & ASSISTANCE CARD */}
      <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              NEED SUPPORT?
            </span>
            <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1.5">
              HELP &amp; ASSISTANCE
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
              Having issues with a purchase or did not receive your items? Our support team is available around the clock. Contact us on our Discord server and create a ticket for instant help.
            </p>
            <a
              href={settings.discordUrl || 'https://discord.gg/nightmaremc'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discord Support</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. PAYMENT INFORMATION & REFUND POLICY CARD */}
      <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-slate-700 dark:text-zinc-300" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
              PAYMENT INFORMATION
            </span>
            <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1.5">
              PURCHASE &amp; DELIVERY POLICY
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              NightmareMC handles all purchases manually through Discord tickets. After generating your order message in checkout, paste it into our ticket channel. A staff member will confirm your final total and provide the payment instructions. Never send payment before staff confirmation.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
