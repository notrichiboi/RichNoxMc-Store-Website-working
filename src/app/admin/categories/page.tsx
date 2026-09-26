'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, GripVertical, RefreshCw } from 'lucide-react';
import { getCategories, updateCategoriesOrder, deleteCategory } from '@/lib/firestore/categories';
import { getProductsByCategory } from '@/lib/firestore/products';
import { Category, Product } from '@/lib/types';
import { AdminDragList } from '@/components/admin/AdminDragList';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { updateCategory } from '@/lib/firestore/categories';
import { toast } from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; category: Category | null; productsCount: number }>({
    isOpen: false,
    category: null,
    productsCount: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (newItems: Category[]) => {
    setCategories(newItems);
    try {
      await updateCategoriesOrder(newItems.map(c => c.id));
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      loadCategories(); // Revert on fail
    }
  };

  const handleToggleEnabled = async (category: Category, enabled: boolean) => {
    try {
      await updateCategory(category.id, { enabled });
      setCategories(categories.map(c => c.id === category.id ? { ...c, enabled } : c));
      toast.success(enabled ? 'Category enabled' : 'Category disabled');
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleDeleteRequest = async (category: Category) => {
    // Check if category has products
    try {
      const products = await getProductsByCategory(category.id);
      setDeleteConfirm({
        isOpen: true,
        category,
        productsCount: products.length
      });
    } catch (error) {
      toast.error('Failed to check category products');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.category) return;
    
    if (deleteConfirm.productsCount > 0) {
      toast.error(`Cannot delete category with ${deleteConfirm.productsCount} products. Move or delete them first.`);
      setDeleteConfirm({ isOpen: false, category: null, productsCount: 0 });
      return;
    }

    try {
      await deleteCategory(deleteConfirm.category.id);
      setCategories(categories.filter(c => c.id !== deleteConfirm.category?.id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setDeleteConfirm({ isOpen: false, category: null, productsCount: 0 });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-zinc-400">Manage your store categories</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setLoading(true);
              loadCategories().then(() => toast.success('Categories refreshed!'));
            }}
            disabled={loading}
            className="p-2.5 bg-[#111118] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/admin/categories/new"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-sm transition-colors flex items-center shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="bg-[#111118] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_100px_100px_100px] gap-4 p-4 border-b border-zinc-800 bg-zinc-900/50 text-xs font-semibold text-zinc-500 uppercase">
            <div></div>
            <div>Name</div>
            <div className="text-center">Status</div>
            <div className="text-right">Actions</div>
          </div>
          
          <div className="p-2">
            <AdminDragList
              items={categories}
              keyExtractor={(item) => item.id}
              onReorder={handleReorder}
              renderItem={(category, dragHandleProps) => (
                <div className="flex items-center grid grid-cols-[40px_1fr_100px_100px_100px] gap-4 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <div {...dragHandleProps} className="text-zinc-500 hover:text-white cursor-grab">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color || '#cc33ff' }} />
                      {category.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">/{category.slug}</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <AdminToggle
                      checked={category.enabled}
                      onChange={(checked) => handleToggleEnabled(category, checked)}
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-md"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteRequest(category)}
                      className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-800 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      )}

      <AdminDeleteConfirm
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, category: null, productsCount: 0 })}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        itemName={deleteConfirm.category?.name}
        warningMessage={deleteConfirm.productsCount > 0 
          ? `WARNING: This category contains ${deleteConfirm.productsCount} products. You cannot delete it until those products are removed or reassigned.` 
          : "Are you sure you want to delete this category? This action cannot be undone."}
      />
    </div>
  );
}
