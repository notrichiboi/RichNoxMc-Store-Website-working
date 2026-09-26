'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getCategories } from '@/lib/firestore/categories';
import type { Category } from '@/lib/types';
import { SkeletonBox } from '../ui/Skeleton';
import { Package, Key, Shield, Sparkles, Layers, Gift } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  ranks: <Shield className="h-8 w-8" />,
  keys: <Key className="h-8 w-8" />,
  cosmetics: <Sparkles className="h-8 w-8" />,
  kits: <Layers className="h-8 w-8" />,
  bundles: <Gift className="h-8 w-8" />,
  default: <Package className="h-8 w-8" />,
};

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCats() {
      try {
        const cats = await getCategories();
        setCategories(cats.filter(c => c.enabled).slice(0, 4));
      } catch (error) {
        console.error('Failed to load categories for showcase', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCats();
  }, []);

  return (
    <section className="py-16 bg-slate-50 dark:bg-[#07070d] text-slate-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">Browse Categories</h2>
          <p className="text-slate-500 dark:text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            Explore our wide selection of packages to upgrade your NightmareMC journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="h-44 rounded-3xl" />
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm dark:shadow-xl">
              <Package className="h-10 w-10 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-zinc-400 text-sm">Categories will appear here once created in the admin panel.</p>
            </div>
          ) : (
            categories.map((category, index) => (
              <Link key={category.id} href={`/store?category=${category.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 text-center hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-xl transition-all group cursor-pointer h-full flex flex-col items-center justify-center shadow-sm"
                >
                  <div className="mb-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    {category.iconUrl ? (
                      <img src={category.iconUrl} alt={category.name} className="h-10 w-10 object-contain rounded" />
                    ) : (
                      iconMap[category.slug] || iconMap.default
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
