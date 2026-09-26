'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Layers, 
  Users, 
  ThumbsUp, 
  BookOpen, 
  Megaphone,
  Settings,
  Type,
  Server,
  MessageSquare,
  Palette,
  CreditCard,
  Plus,
  ExternalLink,
  Sparkles,
  Database
} from 'lucide-react';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { getProducts } from '@/lib/firestore/products';
import { getCategories } from '@/lib/firestore/categories';
import { getPatrons, getRules, getAnnouncements, getVoteLinks } from '@/lib/firestore/content';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { seedDemoData } from '@/lib/utils/demoData';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { settings } = useSettingsContext();
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    patrons: 0,
    rules: 0,
    announcements: 0,
    votes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prods, cats, pats, rls, ann, vts] = await Promise.all([
          getProducts(),
          getCategories(),
          getPatrons(),
          getRules(),
          getAnnouncements(),
          getVoteLinks(),
        ]);
        setCounts({
          products: prods.length,
          categories: cats.length,
          patrons: pats.length,
          rules: rls.length,
          announcements: ann.length,
          votes: vts.length,
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleSeedDemoData = async () => {
    if (!window.confirm('Do you want to seed demo categories and products? This will add example Minecraft items into your database.')) {
      return;
    }

    setSeeding(true);
    try {
      await seedDemoData();
      toast.success('Demo data seeded successfully! Refreshing...');
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setCounts(prev => ({ ...prev, products: prods.length, categories: cats.length }));
    } catch (err) {
      toast.error('Failed to seed demo data');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">NightmareMC Dashboard</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Manage your store packages, server info, community features, and appearance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {counts.products === 0 && (
            <button
              onClick={handleSeedDemoData}
              disabled={seeding}
              className="px-4 py-2 bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-300 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              {seeding ? 'Seeding...' : 'Seed Demo Content'}
            </button>
          )}
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors border border-zinc-700 flex items-center gap-2"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Cards (CMS content only - no orders / payment records) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Products"
          value={loading ? '...' : counts.products.toString()}
          icon={Package}
          colorVariant="purple"
        />
        <AdminStatsCard
          title="Categories"
          value={loading ? '...' : counts.categories.toString()}
          icon={Layers}
          colorVariant="blue"
        />
        <AdminStatsCard
          title="Patrons"
          value={loading ? '...' : counts.patrons.toString()}
          icon={Users}
          colorVariant="orange"
        />
        <AdminStatsCard
          title="Active Rules"
          value={loading ? '...' : counts.rules.toString()}
          icon={BookOpen}
          colorVariant="green"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickAction href="/admin/products/new" icon={Package} label="Add Product" />
          <QuickAction href="/admin/categories/new" icon={Layers} label="Add Category" />
          <QuickAction href="/admin/patrons" icon={Users} label="Add Patron" />
          <QuickAction href="/admin/vote" icon={ThumbsUp} label="Vote Links" />
          <QuickAction href="/admin/rules" icon={BookOpen} label="Add Rule" />
          <QuickAction href="/admin/homepage" icon={Megaphone} label="Announcements" />
        </div>
      </div>

      {/* Setup Checklist */}
      <div className="bg-[#111118] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 bg-[#0d0d14]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Store Configuration Checklist
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Key settings to configure before sharing your store with players
          </p>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <ChecklistItem
              href="/admin/settings"
              icon={Settings}
              label="Configure Site Settings & Currency"
              done={Boolean(settings.siteName && settings.siteName !== 'NightmareMC')}
            />
            <ChecklistItem
              href="/admin/logo"
              icon={Type}
              label="Set Logo & Favicon URLs"
              done={Boolean(settings.logoUrl)}
            />
            <ChecklistItem
              href="/admin/server"
              icon={Server}
              label="Setup Minecraft Server IP & Ports"
              done={true}
            />
            <ChecklistItem
              href="/admin/discord"
              icon={MessageSquare}
              label="Connect Discord Server & Template"
              done={Boolean(settings.discordUrl)}
            />
            <ChecklistItem
              href="/admin/theme"
              icon={Palette}
              label="Customize Brand Colors & Theme"
              done={true}
            />
            <ChecklistItem
              href="/admin/payment"
              icon={CreditCard}
              label="Configure Display Payment Methods"
              done={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-[#0d0d14] border border-zinc-800/80 rounded-2xl hover:bg-zinc-800/40 hover:border-purple-500/40 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-600/20 flex items-center justify-center mb-2.5 transition-colors">
        <Icon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
      </div>
      <span className="text-xs font-semibold text-zinc-300 text-center">{label}</span>
    </Link>
  );
}

function ChecklistItem({
  href,
  icon: Icon,
  label,
  done,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  done: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center p-3 rounded-xl hover:bg-zinc-800/40 transition-colors group"
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 border shrink-0 ${
          done
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-zinc-800/60 border-zinc-700 text-zinc-500'
        }`}
      >
        {done ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </div>
      <div className="flex items-center space-x-2 text-sm text-zinc-300 group-hover:text-white transition-colors min-w-0">
        <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
    </Link>
  );
}
