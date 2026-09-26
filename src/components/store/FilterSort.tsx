'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'newest' | 'az';

interface FilterSortProps {
  onSortChange: (option: SortOption) => void;
  currentSort?: SortOption;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'az', label: 'A → Z' },
];

export function FilterSort({ onSortChange, currentSort = 'featured' }: FilterSortProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#131322] border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2 text-xs sm:text-sm shrink-0">
      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
      <select
        value={currentSort}
        onChange={e => onSortChange(e.target.value as SortOption)}
        className="bg-transparent border-none text-slate-800 dark:text-zinc-200 text-xs sm:text-sm focus:ring-0 cursor-pointer outline-none font-bold"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#111118] text-slate-900 dark:text-zinc-200">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
