'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';
import { Loader2, ShieldAlert, Sparkles, Copy, Check, LogOut, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isFirstAdminSetup, setIsFirstAdminSetup] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!loading) {
      if (!user && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (user && !isAdmin && pathname !== '/admin/login') {
        // Check if any admin exists in the users collection
        getDocs(collection(db, 'users'))
          .then(snap => {
            if (snap.empty) {
              setIsFirstAdminSetup(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [user, loading, isAdmin, pathname, router, mounted]);

  const handleClaimFirstAdmin = async () => {
    if (!user) return;
    setIsClaiming(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        toast.error('An administrator account already exists. Please request access from the owner.');
        setIsFirstAdminSetup(false);
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email || 'admin@nightmaremc.com',
        role: 'admin',
        createdAt: Timestamp.now(),
      });

      toast.success('Congratulations! Admin privileges granted successfully.');
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to initialize admin account');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      toast.success('Firebase UID copied to clipboard!');
      setTimeout(() => setCopiedUid(false), 2500);
    } catch {
      toast.error('Failed to copy UID');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center p-4 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(139,92,246,0.12),transparent)]" />
        
        <div className="w-full max-w-lg relative z-10 bg-[#0d0d14] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {isFirstAdminSetup ? (
            /* First Time Setup Wizard */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  FIRST TIME ADMIN SETUP
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Welcome! No admin account has been created for NightmareMC yet. You are currently logged in as:
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-purple-400 font-mono text-xs font-bold">
                  {user.email}
                </div>
              </div>

              <div className="bg-purple-950/20 border border-purple-800/30 rounded-2xl p-4 text-left text-xs text-zinc-300 space-y-1">
                <p className="font-bold text-purple-300 mb-1">👑 Primary Administrator</p>
                <p>Clicking the button below will initialize your account as the master administrator with full CMS privileges.</p>
              </div>

              <button
                onClick={handleClaimFirstAdmin}
                disabled={isClaiming}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-60"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Granting Admin Privileges...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Claim First Admin Account</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Access Denied */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-red-500 tracking-tight">
                  ACCESS RESTRICTED
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  You are signed in as <strong className="text-white">{user.email}</strong>, but this account has not been granted administrator privileges yet.
                </p>
              </div>

              {/* UID Box with 1-click copy */}
              <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-4 text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    Your Firebase Auth UID
                  </span>
                  <button
                    onClick={handleCopyUid}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUid ? 'Copied!' : 'Copy UID'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-black/60 rounded-xl font-mono text-xs text-zinc-300 break-all select-all border border-zinc-800/80">
                  {user.uid}
                </div>
                <p className="text-[11px] text-zinc-500 pt-1">
                  Ask the server owner to add your UID in <code className="text-purple-400">/admin/admins</code> or add a document in Firestore collection <code className="text-purple-400">users/{user.uid}</code> with <code className="text-purple-400">{`role: "admin"`}</code>.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Store</span>
                </button>

                <button
                  onClick={async () => {
                    await logout();
                    router.push('/admin/login');
                  }}
                  className="py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs border border-red-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#111118] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
