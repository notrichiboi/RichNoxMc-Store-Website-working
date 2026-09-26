'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../store/ProductCard';
import { SkeletonCard } from '../ui/Skeleton';
import { getProducts } from '@/lib/firestore/products';
import { Product } from '@/lib/types';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const allProducts = await getProducts();
        const enabled = allProducts.filter(p => p.enabled);
        const featured = enabled.filter(p => p.featured);
        setProducts(featured.length > 0 ? featured.slice(0, 4) : enabled.slice(0, 4));
      } catch (error) {
        console.error('Failed to load featured products', error);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <section className="py-16 bg-slate-50 dark:bg-[#07070d] text-slate-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
              Featured Packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Our most popular ranks and server packages.
            </p>
          </div>
          <Link href="/store" className="hidden md:flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors gap-1">
            VIEW ALL <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/store" className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium transition-colors">
            VIEW ALL <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
