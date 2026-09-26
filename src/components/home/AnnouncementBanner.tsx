'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveAnnouncements } from '@/lib/firestore/content';
import type { Announcement } from '@/lib/types';

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const list = await getActiveAnnouncements();
        if (list.length > 0) {
          const first = list[0];
          const dismissed = localStorage.getItem(`dismissed_announcement_${first.id}`);
          if (!dismissed) {
            setAnnouncement(first);
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    }
    loadAnnouncement();
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true');
      setIsVisible(false);
    }
  };

  if (!announcement || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-slate-100 dark:bg-[#0d0d14] border-b border-slate-200 dark:border-zinc-800/80 relative overflow-hidden z-30"
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ backgroundColor: announcement.color || '#3b82f6' }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-base shrink-0">
                {announcement.icon || <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </span>
              <div className="text-xs sm:text-sm min-w-0 truncate">
                <span className="font-bold text-slate-900 dark:text-white mr-2">{announcement.title}</span>
                {announcement.description && (
                  <span className="text-slate-600 dark:text-zinc-400 hidden sm:inline">{announcement.description}</span>
                )}
              </div>
              {announcement.buttonText && announcement.buttonUrl && (
                <a
                  href={announcement.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 ml-2 underline underline-offset-2 shrink-0"
                >
                  {announcement.buttonText}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
