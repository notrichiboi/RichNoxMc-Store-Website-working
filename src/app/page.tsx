'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { ServerStatus } from '@/components/home/ServerStatus';
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner';
import { ZenithSidebar } from '@/components/zenith/ZenithSidebar';
import { ZenithStoreMain } from '@/components/zenith/ZenithStoreMain';
import { getProducts } from '@/lib/firestore/products';
import { useSettingsContext } from '@/contexts/SettingsContext';
import type { Product } from '@/lib/types';

export default function HomePage() {
  const { settings } = useSettingsContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await getProducts();
        const enabled = all.filter(p => p.enabled);
        const featured = enabled.filter(p => p.featured);
        setProducts(featured.length > 0 ? featured.slice(0, 3) : enabled.slice(0, 3));
      } catch (err) {
        console.error('Failed to load homepage products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      {/* Optional Top Announcement */}
      {settings.showAnnouncements && <AnnouncementBanner />}

      {/* Zenith Navbar */}
      <Navbar />

      {/* Zenith Landscape Header / Hero */}
      <Hero />

      {/* Live Minecraft Server Status (mcsrvstat v3) */}
      {settings.showServerStatus !== false && (
        <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 mb-8">
          <ServerStatus />
        </div>
      )}

      {/* Main Two-Column Store Experience (Zenith Tebex Architecture) */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Sidebar */}
          <ZenithSidebar />

          {/* Right Main Store Content */}
          <ZenithStoreMain products={products} loading={loading} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
