'use client';

import React, { useState, useEffect } from 'react';
import { getPatrons, addPatron, updatePatron, deletePatron, updatePatronsOrder } from '@/lib/firestore/content';
import { Patron } from '@/lib/types';
import { AdminDragList } from '@/components/admin/AdminDragList';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { Plus, Edit, Trash2, GripVertical, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminPatronsPage() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatron, setEditingPatron] = useState<Partial<Patron> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getPatrons();
      setPatrons(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      toast.error('Failed to load patrons');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (newItems: Patron[]) => {
    setPatrons(newItems);
    try {
      await updatePatronsOrder(newItems.map(i => i.id));
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      loadData();
    }
  };

  const handleSavePatron = async () => {
    if (!editingPatron?.username) {
      toast.error('Username is required');
      return;
    }

    try {
      if (editingPatron.id) {
        await updatePatron(editingPatron.id, editingPatron);
        toast.success('Patron updated');
      } else {
        await addPatron({
          ...editingPatron,
          enabled: editingPatron.enabled ?? true,
          sortOrder: patrons.length
        } as Omit<Patron, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Patron added');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save patron');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deletePatron(deleteConfirm.id);
      toast.success('Patron deleted');
      setDeleteConfirm({ isOpen: false, id: null });
      loadData();
    } catch (error) {
      toast.error('Failed to delete patron');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Patrons</h1>
          <p className="text-zinc-400">Manage your server supporters</p>
        </div>
        <button
          onClick={() => {
            setEditingPatron({ username: '', avatarUrl: '', amount: 0, tierId: '', enabled: true });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patron
        </button>
      </div>

      <div className="bg-[#111118] border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="p-4">
            {patrons.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">No patrons added yet.</div>
            ) : (
              <AdminDragList
                items={patrons}
                keyExtractor={(item) => item.id}
                onReorder={handleReorder}
                renderItem={(patron, dragHandleProps) => (
                  <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center">
                      <div {...dragHandleProps} className="text-zinc-500 hover:text-white cursor-grab mr-4">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                          {patron.avatarUrl ? (
                            <img src={patron.avatarUrl} alt={patron.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{patron.username}</div>
                          <div className="text-xs text-zinc-500">₹{patron.amount} - Tier: {patron.tierId}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <AdminToggle
                        checked={patron.enabled}
                        onChange={async (c) => {
                          await updatePatron(patron.id, { enabled: c });
                          setPatrons(patrons.map(p => p.id === patron.id ? { ...p, enabled: c } : p));
                        }}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingPatron(patron);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: patron.id })}
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
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111118] border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">
                {editingPatron?.id ? 'Edit Patron' : 'Add Patron'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <AdminFormField label="Username" required>
                <input
                  type="text"
                  value={editingPatron?.username || ''}
                  onChange={(e) => setEditingPatron(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Avatar URL">
                <input
                  type="text"
                  value={editingPatron?.avatarUrl || ''}
                  onChange={(e) => setEditingPatron(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Amount Donated">
                <input
                  type="number"
                  value={editingPatron?.amount || 0}
                  onChange={(e) => setEditingPatron(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Tier ID (Optional)">
                <input
                  type="text"
                  value={editingPatron?.tierId || ''}
                  onChange={(e) => setEditingPatron(prev => ({ ...prev, tierId: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminToggle
                label="Enabled"
                checked={!!editingPatron?.enabled}
                onChange={(c) => setEditingPatron(prev => ({ ...prev, enabled: c }))}
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
                onClick={handleSavePatron}
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
        title="Delete Patron"
      />
    </div>
  );
}
