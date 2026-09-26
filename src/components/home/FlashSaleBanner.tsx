'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, X, Clock, Sparkles } from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';

export function FlashSaleBanner() {
  const { settings } = useSettingsContext();
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  const isEnabled = settings.flashSaleEnabled;

  useEffect(() => {
    if (!isEnabled) return;

    // Rolling countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnabled]);

  if (!isEnabled || dismissed) {
    return null;
  }

  const badge = settings.flashSaleBadge || 'FLASH SALE';
  const title = settings.flashSaleTitle || 'Special Server Promotion Active!';
  const subtitle = settings.flashSaleSubtitle || 'Limited time ranks and crate discounts available now.';
  const buttonText = settings.flashSaleButtonText || 'Explore Deals';
  const buttonUrl = settings.flashSaleButtonUrl || '/store';

  return (
    <div className="relative bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 text-white shadow-md z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        {/* Left: Badge & Text */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-yellow-300 font-black text-[11px] uppercase tracking-wider border border-white/20 shadow-xs animate-pulse">
            <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            {badge}
          </span>
          <span className="text-xs sm:text-sm font-bold truncate">
            {title}
          </span>
          <span className="hidden md:inline text-xs text-white/80 font-normal">
            • {subtitle}
          </span>
        </div>

        {/* Right: Countdown & CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Digital Timer */}
          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-yellow-300 border border-white/10">
            <Clock className="w-3 h-3 text-white/80" />
            <span>
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          <Link
            href={buttonUrl}
            className="inline-flex items-center gap-1 px-3.5 py-1 rounded-lg bg-white text-slate-900 font-black text-xs hover:bg-yellow-300 transition-colors shadow-sm"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-black/20 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
