'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/lib/types';
import { addCategory, updateCategory } from '@/lib/firestore/categories';
import { AdminFormField } from './AdminFormField';
import { AdminToggle } from './AdminToggle';
import { AdminColorPicker } from './AdminColorPicker';
import { AdminImageField } from './AdminImageField';
import { AdminSaveBar } from './AdminSaveBar';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryEditorProps {
  initialData?: Category;
  isNew?: boolean;
}

export function CategoryEditor({ initialData, isNew }: CategoryEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    icon: 'Folder',
    iconUrl: '',
    bannerUrl: '',
    color: '#cc33ff',
    enabled: true,
    sortOrder: 0,
    announcement: {
      enabled: false,
      title: '',
      message: '',
      icon: 'Megaphone',
      color: '#cc33ff',
      buttonText: '',
      buttonUrl: ''
    },
    ...initialData
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate slug from name if new
      if (isNew && field === 'name' && (!prev.slug || prev.slug === prev.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      
      return newData;
    });
    setHasChanges(true);
  };

  const handleAnnouncementChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      announcement: {
        ...(prev.announcement || {}),
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        await addCategory(formData as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Category created successfully');
        router.push('/admin/categories');
      } else {
        await updateCategory(initialData!.id, formData);
        toast.success('Category updated successfully');
        setHasChanges(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <AdminBreadcrumb items={[
        { label: 'Categories', href: '/admin/categories' },
        { label: isNew ? 'New Category' : 'Edit Category' }
      ]} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isNew ? 'Create Category' : 'Edit Category'}
          </h1>
          <p className="text-zinc-400 mt-1">
            Configure category details and display settings
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/categories" className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
            
            <AdminFormField label="Category Name" required>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </AdminFormField>

            <AdminFormField label="Slug" helpText="URL-friendly name" required>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </AdminFormField>

            <AdminFormField label="Description">
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </AdminFormField>

            <div className="pt-4 mt-4 border-t border-zinc-800">
              <AdminToggle
                label="Enabled"
                description="Show this category on the store"
                checked={!!formData.enabled}
                onChange={(c) => handleChange('enabled', c)}
              />
            </div>
          </div>

          <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Media & Styling</h2>
            
            <AdminImageField
              label="Banner Image URL"
              helpText="Displayed at the top of the category page"
              value={formData.bannerUrl || ''}
              onChange={(v) => handleChange('bannerUrl', v)}
            />

            <AdminImageField
              label="Icon Image URL"
              helpText="Custom icon image (overrides Lucide icon)"
              value={formData.iconUrl || ''}
              onChange={(v) => handleChange('iconUrl', v)}
            />

            <AdminFormField label="Lucide Icon Name" helpText="e.g., Package, Layers, Sword (used if no Icon URL)">
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </AdminFormField>

            <AdminColorPicker
              label="Accent Color"
              value={formData.color || '#cc33ff'}
              onChange={(v) => handleChange('color', v)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Announcement Banner</h2>
            
            <AdminToggle
              label="Enable Announcement"
              checked={!!formData.announcement?.enabled}
              onChange={(c) => handleAnnouncementChange('enabled', c)}
              className="mb-4"
            />

            {formData.announcement?.enabled && (
              <div className="space-y-4">
                <AdminFormField label="Title">
                  <input
                    type="text"
                    value={formData.announcement.title}
                    onChange={(e) => handleAnnouncementChange('title', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                  />
                </AdminFormField>

                <AdminFormField label="Message">
                  <textarea
                    value={formData.announcement.message}
                    onChange={(e) => handleAnnouncementChange('message', e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                  />
                </AdminFormField>
                
                <AdminColorPicker
                  label="Banner Color"
                  value={formData.announcement.color || '#cc33ff'}
                  onChange={(v) => handleAnnouncementChange('color', v)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminSaveBar
        isVisible={hasChanges}
        onSave={handleSave}
        onDiscard={() => {
          setFormData(initialData || { name: '', slug: '', description: '', icon: 'Folder', color: '#cc33ff', enabled: true, sortOrder: 0 });
          setHasChanges(false);
        }}
        isSaving={isSaving}
      />
    </div>
  );
}
