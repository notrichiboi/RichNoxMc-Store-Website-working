'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore/settings';
import { AdminDragList } from '@/components/admin/AdminDragList';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { Plus, Edit, Trash2, GripVertical, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminNavigationPage() {
  const [navItems, setNavItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settings = await getSiteSettings();
      setNavItems(settings?.navigation || [
        { id: '1', label: 'Home', url: '/', icon: 'Home', enabled: true },
        { id: '2', label: 'Store', url: '/store', icon: 'ShoppingCart', enabled: true },
        { id: '3', label: 'Rules', url: '/rules', icon: 'BookOpen', enabled: true },
        { id: '4', label: 'Vote', url: '/vote', icon: 'ThumbsUp', enabled: true },
        { id: '5', label: 'Patrons', url: '/patrons', icon: 'Heart', enabled: true },
      ]);
    } catch (error) {
      toast.error('Failed to load navigation');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (newItems: any[]) => {
    setNavItems(newItems);
    setHasChanges(true);
  };

  const handleSaveModal = () => {
    if (!editingItem.label || !editingItem.url) {
      toast.error('Label and URL are required');
      return;
    }

    if (editingItem.id) {
      setNavItems(navItems.map(item => item.id === editingItem.id ? editingItem : item));
    } else {
      setNavItems([...navItems, { ...editingItem, id: Date.now().toString() }]);
    }
    
    setIsModalOpen(false);
    setHasChanges(true);
  };

  const handleDelete = (id: string) => {
    setNavItems(navItems.filter(item => item.id !== id));
    setHasChanges(true);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    setNavItems(navItems.map(item => item.id === id ? { ...item, enabled } : item));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = await getSiteSettings();
      await updateSiteSettings({ ...settings, navigation: navItems });
      toast.success('Navigation saved');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save navigation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Navigation</h1>
          <p className="text-zinc-400">Manage the main menu links</p>
        </div>
        <button
          onClick={() => {
            setEditingItem({ label: '', url: '', icon: '', enabled: true });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </button>
      </div>

      <div className="bg-[#111118] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4">
          {navItems.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">No navigation links.</div>
          ) : (
            <AdminDragList
              items={navItems}
              keyExtractor={(item) => item.id}
              onReorder={handleReorder}
              renderItem={(item, dragHandleProps) => (
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center">
                    <div {...dragHandleProps} className="text-zinc-500 hover:text-white cursor-grab mr-4">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center space-x-2">
                        <span>{item.label}</span>
                        {item.icon && <span className="text-xs text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">Icon: {item.icon}</span>}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{item.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <AdminToggle
                      checked={item.enabled}
                      onChange={(c) => handleToggle(item.id, c)}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-800 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111118] border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">
                {editingItem?.id ? 'Edit Link' : 'Add Link'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <AdminFormField label="Label" required>
                <input
                  type="text"
                  value={editingItem?.label || ''}
                  onChange={(e) => setEditingItem((prev: any) => ({ ...prev, label: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="URL" required>
                <input
                  type="text"
                  value={editingItem?.url || ''}
                  onChange={(e) => setEditingItem((prev: any) => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Icon (Lucide Name)">
                <input
                  type="text"
                  value={editingItem?.icon || ''}
                  onChange={(e) => setEditingItem((prev: any) => ({ ...prev, icon: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Home, ShoppingCart"
                />
              </AdminFormField>
              <AdminToggle
                label="Enabled"
                checked={!!editingItem?.enabled}
                onChange={(c) => setEditingItem((prev: any) => ({ ...prev, enabled: c }))}
              />
            </div>
            <div className="p-4 border-t border-zinc-800 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
