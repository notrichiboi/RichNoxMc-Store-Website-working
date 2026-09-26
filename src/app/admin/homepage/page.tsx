'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore/settings';
import { AdminDragList } from '@/components/admin/AdminDragList';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { GripVertical, Layout } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settings = await getSiteSettings();
      setSections(settings?.homepageSections || [
        { id: 'hero', name: 'Hero Section', type: 'Hero', enabled: true },
        { id: 'status', name: 'Server Status', type: 'Server Status', enabled: true },
        { id: 'featured', name: 'Featured Products', type: 'Featured Products', enabled: true },
        { id: 'categories', name: 'Categories Grid', type: 'Categories', enabled: true },
        { id: 'discord', name: 'Discord CTA', type: 'Discord', enabled: true },
      ]);
    } catch (error) {
      toast.error('Failed to load homepage settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (newItems: any[]) => {
    setSections(newItems);
    setHasChanges(true);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    setSections(sections.map(section => section.id === id ? { ...section, enabled } : section));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = await getSiteSettings();
      await updateSiteSettings({ ...settings, homepageSections: sections });
      toast.success('Homepage layout saved');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save homepage layout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Homepage Builder</h1>
        <p className="text-zinc-400">Reorder and toggle sections on the storefront homepage</p>
      </div>

      <div className="bg-[#111118] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center">
            <Layout className="w-4 h-4 mr-2 text-purple-500" />
            Homepage Sections
          </h2>
          <span className="text-xs text-zinc-500">Drag to reorder</span>
        </div>
        
        <div className="p-4">
          <AdminDragList
            items={sections}
            keyExtractor={(item) => item.id}
            onReorder={handleReorder}
            renderItem={(section, dragHandleProps) => (
              <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center">
                  <div {...dragHandleProps} className="text-zinc-500 hover:text-white cursor-grab mr-4">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{section.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">Type: {section.type}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <AdminToggle
                    checked={section.enabled}
                    onChange={(c) => handleToggle(section.id, c)}
                  />
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <AdminSaveBar
        isVisible={hasChanges}
        onSave={handleSave}
        onDiscard={() => {
          loadData();
          setHasChanges(false);
        }}
        isSaving={saving}
      />
    </div>
  );
}
