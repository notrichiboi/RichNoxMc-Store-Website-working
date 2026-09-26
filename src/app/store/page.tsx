'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { ZenithSidebar } from '@/components/zenith/ZenithSidebar';
import { ProductCard } from '@/components/store/ProductCard';
import { SearchBar } from '@/components/store/SearchBar';
import { FilterSort, type SortOption } from '@/components/store/FilterSort';
import { getCategories } from '@/lib/firestore/categories';
import { getProducts } from '@/lib/firestore/products';
import type { Product, Category } from '@/lib/types';
import { ShoppingBag, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

function StoreInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = searchParams ? searchParams.get('category') || '' : '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        setCategories(cats.filter(c => c.enabled));
        setProducts(prods.filter(p => p.enabled));
      } catch (err) {
        console.error('Store load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeCategory = categories.find(c => c.slug === categorySlug) || null;

  const handleCategorySelect = (slug: string) => {
    if (slug) {
      router.push(`/store?category=${slug}`);
    } else {
      router.push('/store');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    if (categorySlug && activeCategory) {
      result = result.filter(p => p.categoryId === activeCategory.id);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'price_asc': {
          const pricesA = a.prices || (a as any).price || {};
          const pricesB = b.prices || (b as any).price || {};
          const pa = pricesA['INR'] ?? pricesA['USD'] ?? 0;
          const pb = pricesB['INR'] ?? pricesB['USD'] ?? 0;
          return pa - pb;
        }
        case 'price_desc': {
          const pricesA = a.prices || (a as any).price || {};
          const pricesB = b.prices || (b as any).price || {};
          const pa = pricesA['INR'] ?? pricesA['USD'] ?? 0;
          const pb = pricesB['INR'] ?? pricesB['USD'] ?? 0;
          return pb - pa;
        }
        case 'az': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [products, categorySlug, activeCategory, searchQuery, sortOption]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <Hero />

      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          
          {/* Zenith Sidebar */}
          <ZenithSidebar
            activeCategory={categorySlug}
            onSelectCategory={handleCategorySelect}
          />

          {/* Store Main Column */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Search + Filter Controls */}
            <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="w-full sm:w-80">
                <SearchBar onSearch={setSearchQuery} />
              </div>
              <FilterSort onSortChange={setSortOption} currentSort={sortOption} />
            </div>

            {/* Active Category Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {activeCategory ? activeCategory.name : 'All Store Packages'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                  {activeCategory?.description || 'Browse all server ranks, crate keys, kits, and value bundles.'}
                </p>
              </div>

              {(categorySlug || searchQuery) && (
                <button
                  onClick={() => {
                    handleCategorySelect('');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 bg-white dark:bg-[#0e0e18] border border-slate-200 dark:border-zinc-800 rounded-3xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-16 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-1">
                  No packages found
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-500">
                  {searchQuery ? 'Try adjusting your search query.' : 'Packages will appear here once configured.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredAndSorted.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#07070d]" />}>
      <StoreInner />
    </Suspense>
  );
}
