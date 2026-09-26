'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Key, UserCheck, AlertCircle, Info } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import type { AdminUser } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUid, setNewUid] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('admin');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; admin: AdminUser | null }>({
    isOpen: false,
    admin: null,
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() } as AdminUser));
      setAdmins(list);
    } catch (error) {
      toast.error('Failed to load administrator accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUid.trim() || !newEmail.trim()) {
      toast.error('Please enter both the Firebase Auth UID and email address');
      return;
    }

    setSubmitting(true);
    try {
      const userRef = doc(db, 'users', newUid.trim());
      const adminData: AdminUser = {
        uid: newUid.trim(),
        email: newEmail.trim(),
        role: newRole,
        createdAt: Timestamp.now(),
      };
      await setDoc(userRef, adminData);
      setAdmins(prev => [...prev.filter(a => a.uid !== newUid.trim()), adminData]);
      toast.success(`Administrator access granted to ${newEmail}`);
      setShowAddModal(false);
      setNewUid('');
      setNewEmail('');
    } catch (error) {
      toast.error('Failed to add administrator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (admin: AdminUser, newRoleValue: 'admin' | 'moderator') => {
    try {
      await updateDoc(doc(db, 'users', admin.uid), { role: newRoleValue });
      setAdmins(admins.map(a => (a.uid === admin.uid ? { ...a, role: newRoleValue } : a)));
      toast.success(`Role updated to ${newRoleValue}`);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.admin) return;
    if (deleteConfirm.admin.uid === currentUser?.uid) {
      toast.error('You cannot remove your own administrator account');
      setDeleteConfirm({ isOpen: false, admin: null });
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', deleteConfirm.admin.uid));
      setAdmins(admins.filter(a => a.uid !== deleteConfirm.admin?.uid));
      toast.success('Administrator privileges revoked');
    } catch (error) {
      toast.error('Failed to revoke privileges');
    } finally {
      setDeleteConfirm({ isOpen: false, admin: null });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Administrator Accounts
          </h1>
          <p className="text-zinc-400 text-sm">
            Manage who has access to configure NightmareMC through this admin panel
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Admin / Moderator
        </button>
      </div>

      {/* Guide notice */}
      <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
          <Info className="w-4 h-4" />
          How to Grant Access to a New Staff Member
        </div>
        <ol className="text-xs text-zinc-400 space-y-1 list-decimal list-inside leading-relaxed pl-1">
          <li>Create the user account in Firebase Console → <strong>Authentication</strong> → <strong>Users</strong> (or have them sign up).</li>
          <li>Copy their Firebase <strong>User UID</strong> (a long string like <code className="text-zinc-300">5a7b8c...</code>).</li>
          <li>Click &ldquo;Add Admin / Moderator&rdquo; above and paste their UID and email.</li>
        </ol>
      </div>

      {/* List */}
      <div className="bg-[#111118] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">
            Active Accounts ({admins.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#0a0a0f] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No admin accounts found</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              No documents exist in the <code className="text-purple-400">users</code> collection yet. Add your Firebase user UID above to ensure uninterrupted access.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {admins.map(admin => {
              const isSelf = admin.uid === currentUser?.uid;
              return (
                <div
                  key={admin.uid}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-sm shrink-0">
                      {admin.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{admin.email}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">
                        UID: {admin.uid}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <select
                      value={admin.role}
                      onChange={e => handleRoleChange(admin, e.target.value as 'admin' | 'moderator')}
                      className="bg-[#0a0a0f] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="admin">Administrator (Full Access)</option>
                      <option value="moderator">Moderator</option>
                    </select>

                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, admin })}
                      disabled={isSelf}
                      title={isSelf ? 'Cannot remove yourself' : 'Revoke access'}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white">Add Administrator</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Grant access to a registered Firebase user.
              </p>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Firebase User UID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9f8a7b6c5d4e3f2a1b0..."
                  value={newUid}
                  onChange={e => setNewUid(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono placeholder:font-sans"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Copy from Firebase Console → Authentication → Users table
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@nightmaremc.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as 'admin' | 'moderator')}
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                >
                  {submitting ? 'Adding...' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AdminDeleteConfirm
        isOpen={deleteConfirm.isOpen}
        title="Revoke Administrator Access"
        message={`Are you sure you want to revoke administrator access for ${deleteConfirm.admin?.email}? They will no longer be able to access the admin panel.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, admin: null })}
      />
    </div>
  );
}
