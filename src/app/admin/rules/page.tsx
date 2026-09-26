'use client';

import React, { useState, useEffect } from 'react';
import { getRules, addRule, updateRule, deleteRule, updateRulesOrder } from '@/lib/firestore/content';
import { Rule } from '@/lib/types';
import { AdminDragList } from '@/components/admin/AdminDragList';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { Plus, Edit, Trash2, GripVertical, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<Rule> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getRules();
      setRules(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (newItems: Rule[]) => {
    setRules(newItems);
    try {
      await updateRulesOrder(newItems.map(i => i.id));
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      loadData();
    }
  };

  const handleSaveRule = async () => {
    if (!editingRule?.title || !editingRule?.description) {
      toast.error('Title and description are required');
      return;
    }

    try {
      if (editingRule.id) {
        await updateRule(editingRule.id, editingRule);
        toast.success('Rule updated');
      } else {
        await addRule({
          ...editingRule,
          number: rules.length + 1,
          enabled: editingRule.enabled ?? true,
          sortOrder: rules.length
        } as Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Rule added');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save rule');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteRule(deleteConfirm.id);
      toast.success('Rule deleted');
      setDeleteConfirm({ isOpen: false, id: null });
      loadData();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Rules</h1>
          <p className="text-zinc-400">Manage server rules</p>
        </div>
        <button
          onClick={() => {
            setEditingRule({ title: '', description: '', category: 'General', enabled: true });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </button>
      </div>

      <div className="bg-[#111118] border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="p-4">
            {rules.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">No rules added yet.</div>
            ) : (
              <AdminDragList
                items={rules}
                keyExtractor={(item) => item.id}
                onReorder={handleReorder}
                renderItem={(rule, dragHandleProps) => (
                  <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-start">
                      <div {...dragHandleProps} className="mt-1 text-zinc-500 hover:text-white cursor-grab mr-4 flex-shrink-0">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{rule.number}. {rule.title}</div>
                        <div className="text-sm text-zinc-500 mt-1 line-clamp-1">{rule.description}</div>
                        <div className="text-xs text-purple-400 mt-1">{rule.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                      <AdminToggle
                        checked={rule.enabled}
                        onChange={async (c) => {
                          await updateRule(rule.id, { enabled: c });
                          setRules(rules.map(r => r.id === rule.id ? { ...r, enabled: c } : r));
                        }}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: rule.id })}
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
          <div className="bg-[#111118] border border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">
                {editingRule?.id ? 'Edit Rule' : 'Add Rule'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <AdminFormField label="Title" required>
                <input
                  type="text"
                  value={editingRule?.title || ''}
                  onChange={(e) => setEditingRule(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Description" required>
                <textarea
                  value={editingRule?.description || ''}
                  onChange={(e) => setEditingRule(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminFormField label="Category">
                <input
                  type="text"
                  value={editingRule?.category || ''}
                  onChange={(e) => setEditingRule(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                />
              </AdminFormField>
              <AdminToggle
                label="Enabled"
                checked={!!editingRule?.enabled}
                onChange={(c) => setEditingRule(prev => ({ ...prev, enabled: c }))}
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
                onClick={handleSaveRule}
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
        title="Delete Rule"
      />
    </div>
  );
}
