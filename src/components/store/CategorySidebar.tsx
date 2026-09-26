'use client';

import React from 'react';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Package, Shield, Key, Sparkles, ChevronRight,
  Star, Gift, Coins, Shirt, Layers
} from 'lucide-react';

interface CategorySidebarProps {
  categories: Category[];
  activeCategorySlug: string;
  onSelect: (slug: string) => void;
  loading?: boolean;
}

const SLUG_ICONS: Record<string, React.ReactNode> = {
  ranks: <Shield className="h-4 w-4" />,
  rank: <Shield className="h-4 w-4" />,
  keys: <Key className="h-4 w-4" />,
  'crate-keys': <Key className="h-4 w-4" />,
  crates: <Gift className="h-4 w-4" />,
  cosmetics: <Sparkles className="h-4 w-4" />,
  kits: <Layers className="h-4 w-4" />,
  coins: <Coins className="h-4 w-4" />,
  bundles: <Gift className="h-4 w-4" />,
  featured: <Star className="h-4 w-4" />,
  cosmetic: <Shirt className="h-4 w-4" />,
};

const DEFAULT_ICON = <Package className="h-4 w-4" />;

function getCategoryIcon(slug: string): React.ReactNode {
  return SLUG_ICONS[slug.toLowerCase()] || DEFAULT_ICON;
}

export function CategorySidebar({
  categories,
  activeCategorySlug,
  onSelect,
  loading,
}: CategorySidebarProps) {
  if (loading) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-xl bg-zinc-800/40 animate-pulse"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-3 sticky top-24">
      <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-2 pt-1">
        Categories
      </h3>
      <nav className="space-y-0.5">
        {/* All products */}
        <button
          onClick={() => onSelect('')}
          className={cn(
            'w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left',
            !activeCategorySlug
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
              : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white border border-transparent'
          )}
        >
          <div className="flex items-center gap-2.5">
            <Package className="h-4 w-4 flex-shrink-0" />
            <span>All Products</span>
          </div>
          {!activeCategorySlug && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
        </button>

        {categories.map(category => {
          const isActive = activeCategorySlug === category.slug;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.slug)}
              className={cn(
                'w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left',
                isActive
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white border border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex-shrink-0" style={{ color: isActive ? '#c084fc' : undefined }}>
                  {category.iconUrl ? (
                    <img src={category.iconUrl} alt="" className="h-4 w-4 object-contain rounded" />
                  ) : (
                    getCategoryIcon(category.slug)
                  )}
                </span>
                <span className="truncate">{category.name}</span>
              </div>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
