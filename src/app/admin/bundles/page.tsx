'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Box, Sparkles, AlertCircle } from 'lucide-react';
import { getProducts, updateProduct, deleteProduct } from '@/lib/firestore/products';
import type { Product } from '@/lib/types';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import toast from 'react-hot-toast';

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allProducts = await getProducts();
      const bundleProducts = allProducts.filter(p => p.isBundle);
      setBundles(bundleProducts);
    } catch (error) {
      toast.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (bundle: Product, enabled: boolean) => {
    try {
      await updateProduct(bundle.id, { enabled });
      setBundles(bundles.map(b => (b.id === bundle.id ? { ...b, enabled } : b)));
      toast.success(enabled ? 'Bundle enabled' : 'Bundle disabled');
    } catch (error) {
      toast.error('Failed to update bundle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.product) return;
    try {
      await deleteProduct(deleteConfirm.product.id);
      setBundles(bundles.filter(b => b.id !== deleteConfirm.product?.id));
      toast.success('Bundle deleted successfully');
    } catch (error) {
      toast.error('Failed to delete bundle');
    } finally {
      setDeleteConfirm({ isOpen: false, product: null });
    }
  };

  const filteredBundles = bundles.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.shortDescription.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-purple-400" />
            Product Bundles
          </h1>
          <p className="text-zinc-400 text-sm">
            Group multiple items together into value packs with discounts for players
          </p>
        </div>
        <Link
          href="/admin/products/new?bundle=true"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4" />
          Create Bundle
        </Link>
      </div>

      {/* Info Card */}
      <div className="bg-purple-950/20 border border-purple-800/30 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-sm text-zinc-300">
          <p className="font-semibold text-purple-300 mb-0.5">How Bundles Work</p>
          <p className="text-zinc-400 leading-relaxed text-xs">
            Bundles appear in the store like normal products, but contain multiple individual products. When a player views a bundle, they see all items included and the discounted price.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search bundles by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-[#111118] border border-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBundles.length === 0 ? (
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-12 text-center">
          <Box className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">
            {search ? 'No bundles match your search' : 'No bundles created yet'}
          </h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
            {search
              ? 'Try adjusting your search terms.'
              : 'Create your first bundle pack to offer combined ranks, keys, and perks at a special price.'}
          </p>
          {!search && (
            <Link
              href="/admin/products/new?bundle=true"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Bundle
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBundles.map(bundle => {
            const itemCount = bundle.bundleItems?.length || 0;
            const priceINR = bundle.prices?.INR ?? bundle.prices?.USD ?? 0;
            return (
              <div
                key={bundle.id}
                className="bg-[#111118] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base truncate">{bundle.name}</h3>
                        {bundle.badge && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase text-white"
                            style={{ backgroundColor: bundle.badgeColor || '#8b5cf6' }}
                          >
                            {bundle.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-400 mt-0.5 font-medium">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} included
                      </p>
                    </div>
                    <AdminToggle
                      checked={bundle.enabled}
                      onChange={enabled => handleToggleEnabled(bundle, enabled)}
                    />
                  </div>

                  {bundle.shortDescription && (
                    <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {bundle.shortDescription}
                    </p>
                  )}

                  {/* Included items preview */}
                  {bundle.bundleItems && bundle.bundleItems.length > 0 && (
                    <div className="bg-[#0a0a0f] border border-zinc-800/60 rounded-xl p-3 mb-4 space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Includes:
                      </p>
                      {bundle.bundleItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="text-xs text-zinc-300 flex justify-between">
                          <span className="truncate">• {item.productName}</span>
                          <span className="text-zinc-500 shrink-0 ml-2">×{item.quantity}</span>
                        </div>
                      ))}
                      {bundle.bundleItems.length > 3 && (
                        <p className="text-[10px] text-zinc-500 italic">
                          +{bundle.bundleItems.length - 3} more items
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-500 block">Price</span>
                    <span className="font-bold text-white text-lg">
                      {bundle.prices?.INR ? `₹${bundle.prices.INR}` : `$${priceINR}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${bundle.id}`}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Edit Bundle"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, product: bundle })}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Bundle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminDeleteConfirm
        isOpen={deleteConfirm.isOpen}
        title="Delete Bundle"
        message={`Are you sure you want to delete the bundle "${deleteConfirm.product?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, product: null })}
      />
    </div>
  );
}
