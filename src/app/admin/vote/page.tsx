'use client';

import React, { useState, useEffect } from 'react';
import { getVoteLinks, addVoteLink, updateVoteLink, deleteVoteLink, updateVoteLinksOrder, getSiteSettings, updateSiteSettings } from '@/lib/firestore/content';
import { VoteLink } from '@/lib/types';
import { AdminDragList } from '@/components/admin/AdminDragList';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { Plus, Edit, Trash2, GripVertical, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminVotePage() {
  const [links, setLinks] = useState<VoteLink[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingsHasChanges, setSettingsHasChanges] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<VoteLink> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [linksData, settingsData] = await Promise.all([
        getVoteLinks(),
        getSiteSettings() // Assuming settings holds vote text
      ]);
      setLinks(linksData.sort((a, b) => a.sortOrder - b.sortOrder));
      setSettings(settingsData?.vote || {
        enabled: true,
        title: 'Vote for Us',
        description: 'Support the server by voting every day!',
        announcement: { enabled: false, title: '', message: '' }
      });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
    setSettingsHasChanges(true);
  };

  const handleSettingsNestedChange = (parent: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: value
      }
    }));
    setSettingsHasChanges(true);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const allSettings = await getSiteSettings();
      await updateSiteSettings({ ...allSettings, vote: settings });
      toast.success('Settings saved');
      setSettingsHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReorder = async (newItems: VoteLink[]) => {
    setLinks(newItems);
    try {
      await updateVoteLinksOrder(newItems.map(i => i.id));
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      loadData();
    }
  };

  const handleSaveLink = async () => {
    if (!editingLink?.name || !editingLink?.url) {
      toast.error('Name and URL are required');
      return;
    }

    try {
      if (editingLink.id) {
        await updateVoteLink(editingLink.id, editingLink);
        toast.success('Vote link updated');
      } else {
        await addVoteLink({
          ...editingLink,
          enabled: editingLink.enabled ?? true,
          sortOrder: links.length
        } as Omit<VoteLink, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Vote link added');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save vote link');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteVoteLink(deleteConfirm.id);
      toast.success('Vote link deleted');
      setDeleteConfirm({ isOpen: false, id: null });
      loadData();
    } catch (error) {
      toast.error('Failed to delete vote link');
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Vote Links</h1>
          <p className="text-zinc-400">Manage voting links and rewards</p>
        </div>
        <button
          onClick={() => {
            setEditingLink({ name: '', url: '', description: '', reward: '', icon: 'ThumbsUp', enabled: true });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-[#111118] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Vote Links</h2>
          </div>
          <div className="p-4">
            {links.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">No vote links added yet.</div>
            ) : (
              <AdminDragList
                items={links}
                keyExtractor={(item) => item.id}
                onReorder={handleReorder}
                renderItem={(link, dragHandleProps) => (
                  <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center">
                      <div {...dragHandleProps} className="text-zinc-500 hover:text-white cursor-grab mr-4">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{link.name}</div>
                        <div className="text-xs text-zinc-500 mt-1">{link.url}</div>
                        <div className="text-xs text-purple-400 mt-1">Reward: {link.reward}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <AdminToggle
                        checked={link.enabled}
                        onChange={async (c) => {
                          await updateVoteLink(link.id, { enabled: c });
                          setLinks(links.map(l => l.id === link.id ? { ...l, enabled: c } : l));
                        }}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingLink(link);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: link.id })}
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

        <div className="space-y-6">
          <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Page Settings</h2>
            <div className="space-y-4">
              <AdminToggle
                label="Enable Voting Page"
                checked={!!settings.enabled}
                onChange={(c) => handleSettingsChange('enabled', c)}
              />
              <AdminFormField label="Page Title">
                <input
                  type="text"
                  value={settings.title || ''}
                  onChange={(e) => handleSettingsChange('title', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Page Description">
                <textarea
                  value={settings.description || ''}
                  onChange={(e) => handleSettingsChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
            </div>
          </div>

          <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Announcement Banner</h2>
            <div className="space-y-4">
              <AdminToggle
                label="Enable Banner"
                checked={!!settings.announcement?.enabled}
                onChange={(c) => handleSettingsNestedChange('announcement', 'enabled', c)}
              />
              {settings.announcement?.enabled && (
                <>
                  <AdminFormField label="Banner Title">
                    <input
                      type="text"
                      value={settings.announcement?.title || ''}
                      onChange={(e) => handleSettingsNestedChange('announcement', 'title', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                    />
                  </AdminFormField>
                  <AdminFormField label="Banner Message">
                    <textarea
                      value={settings.announcement?.message || ''}
                      onChange={(e) => handleSettingsNestedChange('announcement', 'message', e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                    />
                  </AdminFormField>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111118] border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">
                {editingLink?.id ? 'Edit Vote Link' : 'Add Vote Link'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <AdminFormField label="Site Name" required>
                <input
                  type="text"
                  value={editingLink?.name || ''}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Vote URL" required>
                <input
                  type="text"
                  value={editingLink?.url || ''}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Description">
                <input
                  type="text"
                  value={editingLink?.description || ''}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Reward Text">
                <input
                  type="text"
                  value={editingLink?.reward || ''}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, reward: e.target.value }))}
                  placeholder="e.g. 1x Vote Key"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Icon (Lucide Name)">
                <input
                  type="text"
                  value={editingLink?.icon || 'ThumbsUp'}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminToggle
                label="Enabled"
                checked={!!editingLink?.enabled}
                onChange={(c) => setEditingLink(prev => ({ ...prev, enabled: c }))}
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
                onClick={handleSaveLink}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminDeleteConfirm
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Vote Link"
      />

      <AdminSaveBar
        isVisible={settingsHasChanges}
        onSave={saveSettings}
        onDiscard={() => {
          loadData();
          setSettingsHasChanges(false);
        }}
        isSaving={savingSettings}
      />
    </div>
  );
}
