'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShieldCheck } from 'lucide-react';
import { usePlayerContext } from '@/contexts/PlayerContext';
import toast from 'react-hot-toast';

export function PlayerLoginModal() {
  const { isLoginModalOpen, setIsLoginModalOpen, loginPlayer, player, logoutPlayer } = usePlayerContext();
  const [edition, setEdition] = useState<'Java' | 'Bedrock'>(player?.edition || 'Java');
  const [username, setUsername] = useState(player?.username || '');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter your Minecraft username');
      return;
    }
    loginPlayer(username.trim(), edition);
    toast.success(`Welcome, ${username.trim()}!`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white dark:bg-[#11111a] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {player ? 'PLAYER PROFILE' : 'LOG IN'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Enter your in-game name to continue.
            </p>
          </div>

          {/* If already logged in, show current player card */}
          {player ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#0a0a10] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
                <img
                  src={`https://mc-heads.net/avatar/${player.username}/64`}
                  alt={player.username}
                  className="w-14 h-14 rounded-xl shadow-md bg-slate-200 dark:bg-zinc-800 shrink-0"
                  onError={e => {
                    (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/64';
                  }}
                />
                <div className="min-w-0">
                  <p className="font-black text-slate-900 dark:text-white text-base truncate">
                    {player.username}
                  </p>
                  <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {player.edition} Edition
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    logoutPlayer();
                    setUsername('');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-bold transition-colors"
                >
                  Change Account
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Platform selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#0a0a10] p-1 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEdition('Java')}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      edition === 'Java'
                        ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Java
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdition('Bedrock')}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      edition === 'Bedrock'
                        ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Bedrock
                  </button>
                </div>
              </div>

              {/* In-game name input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  In-Game Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Your in-game name..."
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0a0a10] border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01]"
              >
                Continue
              </button>

              {/* Notice */}
              <div className="flex items-center gap-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/30 rounded-2xl p-3 text-xs text-blue-700 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
                <span>Purchases will securely arrive to the name you enter here.</span>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
