'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { getServerSettings } from '@/lib/firestore/settings';
import toast from 'react-hot-toast';
import { playLevelUpSound } from '@/lib/utils/audio';

export function Hero() {
  const { settings } = useSettingsContext();
  const [copied, setCopied] = useState(false);
  const [serverIp, setServerIp] = useState('play.nightmaremc.com');

  useEffect(() => {
    getServerSettings().then(s => {
      if (s?.javaIp) {
        setServerIp(s.javaIp);
      } else if ((s as any)?.java?.ip) {
        setServerIp((s as any).java.ip);
      }
    }).catch(() => {});
  }, []);

  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText(serverIp);
      setCopied(true);
      playLevelUpSound();
      toast.success('Server IP copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Could not copy IP');
    }
  };

  const heroLogoPx = settings.heroLogoSize || 200;
  const isFloating = settings.floatingLogoEnabled !== false;
  const hasGlow = settings.floatingLogoGlow !== false;
  const floatDuration = settings.floatingLogoSpeed || 5;

  return (
    <section className="relative w-full pt-20 pb-8 sm:pt-24 sm:pb-12 overflow-hidden">
      {/* Scenic Background Banner (Zenith Style) */}
      <div className="max-w-[1380px] mx-auto px-3 sm:px-6">
        <div className="relative w-full min-h-[340px] sm:min-h-[400px] md:min-h-[460px] py-10 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center">
          
          {/* Scenic Background Image / Gradient */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{
              backgroundImage: settings.ogImageUrl || settings.logoUrl
                ? `url(${settings.ogImageUrl || settings.logoUrl})`
                : `radial-gradient(ellipse at 50% 30%, #fde68a 0%, #f9a8d4 35%, #a5b4fc 70%, #6366f1 100%)`,
            }}
          />

          {/* Fallback fantasy landscape overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-slate-900/20 dark:from-[#07070d] dark:via-black/40 dark:to-transparent" />

          {/* Mountains & Floating Islands silhouette representation */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Center Content: Floating Emblem + Flanking Action Buttons */}
          <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full">
            
            {/* Center Floating Emblem (Scalable Size) */}
            <motion.div
              animate={isFloating ? { y: [0, -12, 0] } : undefined}
              transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
              className={`relative z-10 mb-6 transition-all ${
                hasGlow ? 'drop-shadow-[0_15px_40px_rgba(168,85,247,0.6)]' : ''
              }`}
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  style={{
                    width: `${heroLogoPx}px`,
                    height: `${heroLogoPx}px`,
                    maxWidth: '85vw',
                  }}
                  className="object-contain transition-all duration-300"
                />
              ) : (
                /* Default 3D Zenith Crystal Crest */
                <div
                  style={{
                    width: `${heroLogoPx}px`,
                    height: `${heroLogoPx}px`,
                    maxWidth: '85vw',
                  }}
                  className="relative flex items-center justify-center transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-3xl rotate-45 shadow-2xl shadow-purple-500/50 border-2 border-white/40" />
                  <div className="absolute inset-2 bg-gradient-to-tr from-cyan-400 to-indigo-700 rounded-2xl rotate-45 border border-white/60" />
                  <span
                    style={{ fontSize: `${Math.round(heroLogoPx * 0.35)}px` }}
                    className="relative z-10 font-black text-white drop-shadow-md"
                  >
                    N
                  </span>
                </div>
              )}
            </motion.div>

            {/* Actions Bar Flanking underneath the Emblem */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-xl">
              
              {/* Left Button: Play Now */}
              <button
                onClick={handleCopyIp}
                className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/40 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Now</span>
              </button>

              {/* IP Copied Pill */}
              <button
                onClick={handleCopyIp}
                className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm font-mono font-bold rounded-2xl shadow-lg backdrop-blur-md border border-white/40 dark:border-white/10 transition-all hover:scale-105"
                title="Click to copy server IP"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-green-600 dark:text-green-400">IP COPIED!</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <span>{serverIp}</span>
                    <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-1 shrink-0" />
                  </>
                )}
              </button>

              {/* Right Button: Join Discord */}
              <a
                href={settings.discordUrl || 'https://discord.gg/nightmaremc'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-[#5865F2]/40 hover:scale-105 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Join Discord</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
