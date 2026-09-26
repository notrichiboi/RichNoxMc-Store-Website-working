'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon, Box, RefreshCw } from 'lucide-react';
import { getProducts, updateProduct, deleteProduct } from '@/lib/firestore/products';
import { getCategories } from '@/lib/firestore/categories';
import type { Product, Category } from '@/lib/types';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      
      // Sort safely by createdAt or sortOrder
      const sorted = [...productsData].sort((a, b) => {
        const timeA = a.createdAt?.seconds ?? 0;
        const timeB = b.createdAt?.seconds ?? 0;
        if (timeB !== timeA) return timeB - timeA;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      });

      setProducts(sorted);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (product: Product, enabled: boolean) => {
    try {
      await updateProduct(product.id, { enabled });
      setProducts(products.map(p => p.id === product.id ? { ...p, enabled } : p));
      toast.success(enabled ? 'Product enabled' : 'Product disabled');
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.product) return;
    
    try {
      await deleteProduct(deleteConfirm.product.id);
      setProducts(products.filter(p => p.id !== deleteConfirm.product?.id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleteConfirm({ isOpen: false, product: null });
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.categoryId === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (id: string, storedName?: string) => {
    if (storedName) return storedName;
    return categories.find(c => c.id === id)?.name || 'General';
  };

  const getPriceINR = (product: Product) => {
    if (product.prices?.INR != null) return `₹${product.prices.INR}`;
    if ((product as any).price?.INR != null) return `₹${(product as any).price.INR}`;
    if (product.prices?.USD != null) return `$${product.prices.USD}`;
    return '₹0';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-purple-400" />
            Products &amp; Packages
          </h1>
          <p className="text-zinc-400 text-sm">Manage store ranks, crate keys, kits, bundles, and custom items</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setLoading(true);
              loadData().then(() => toast.success('Products refreshed!'));
            }}
            disabled={loading}
            className="p-2.5 bg-[#111118] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
            title="Refresh Products List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-[#111118] border border-zinc-800 rounded-2xl overflow-hidden mb-6 shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-zinc-500"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-zinc-400">
            <Box className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No products found</p>
            <p className="text-xs text-zinc-500 mt-1">
              {search || categoryFilter ? 'Try changing your search or filter.' : 'Click "Add Product" above to create your first package!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Media / Preview</th>
                  <th className="px-5 py-3.5">Active</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProducts.map((product) => {
                  const displayImg = product.imageUrl || product.iconUrl;
                  const galleryCount = product.galleryImages?.length || 0;
                  const hasKitPreview = Boolean(product.kitPreviewImageUrl);

                  return (
                    <tr key={product.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {displayImg ? (
                              <img src={displayImg} alt={product.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Box className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span className="truncate">{product.name}</span>
                              {product.badge && (
                                <span
                                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full text-white shrink-0"
                                  style={{ backgroundColor: product.badgeColor || '#8b5cf6' }}
                                >
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 font-mono mt-0.5">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-zinc-300">
                        {getCategoryName(product.categoryId, product.categoryName)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-purple-400 font-bold font-mono">
                        {getPriceINR(product)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {hasKitPreview && (
                            <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                              🎒 Kit Preview
                            </span>
                          )}
                          {galleryCount > 0 && (
                            <span className="text-[10px] bg-blue-500/15 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                              📷 +{galleryCount} img
                            </span>
                          )}
                          {!hasKitPreview && galleryCount === 0 && (
                            <span className="text-zinc-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <AdminToggle
                          checked={product.enabled}
                          onChange={(c) => handleToggleEnabled(product, c)}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, product })}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminDeleteConfirm
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, product: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        itemName={deleteConfirm.product?.name}
      />
    </div>
  );
}
