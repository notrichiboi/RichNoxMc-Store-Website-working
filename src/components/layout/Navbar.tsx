'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Menu, X, ChevronDown,
  Sun, Moon, User, Sparkles, Volume2, VolumeX
} from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useCartContext } from '@/contexts/CartContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { CartDrawer } from '../cart/CartDrawer';
import { cn } from '@/lib/utils';
import { isSoundEnabled, toggleSound, playLevelUpSound } from '@/lib/utils/audio';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Store', href: '/store' },
  { name: 'Vote', href: '/vote' },
  { name: 'Patrons', href: '/patrons' },
  { name: 'Rules', href: '/rules' },
  { name: 'Support', href: '/support' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const pathname = usePathname();

  const { settings } = useSettingsContext();
  const { totalItems } = useCartContext();
  const { selectedCurrency, setSelectedCurrency, currencies } = useCurrencyContext();
  const { theme, toggleTheme } = useThemeContext();
  const { player, setIsLoginModalOpen } = usePlayerContext();
  const [soundActive, setSoundActive] = useState(true);

  useEffect(() => {
    setSoundActive(isSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    toggleSound(next);
    if (next) {
      playLevelUpSound();
      toast.success('Store audio enabled!');
    } else {
      toast('Store audio muted', { icon: '🔇' });
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const close = () => setIsCurrencyOpen(false);
    if (isCurrencyOpen) {
      setTimeout(() => document.addEventListener('click', close), 0);
      return () => document.removeEventListener('click', close);
    }
  }, [isCurrencyOpen]);

  const enabledNavLinks = NAV_LINKS.filter(link => {
    if (link.href === '/vote' && !settings.showVote) return false;
    if (link.href === '/patrons' && !settings.showPatrons) return false;
    if (link.href === '/rules' && !settings.showRules) return false;
    if (link.href === '/support' && !settings.showSupport) return false;
    return true;
  });

  const activeCurrencies = currencies.filter(c => c.enabled);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'py-2.5 bg-white/90 dark:bg-[#090912]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl'
            : 'py-4 bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              {settings.logoUrl ? (
                <div
                  style={{
                    height: `${settings.navbarLogoSize || 38}px`,
                    width: `${settings.navbarLogoSize || 38}px`
                  }}
                  className="relative rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  <img src={settings.logoUrl} alt={settings.siteName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div
                  style={{
                    height: `${settings.navbarLogoSize || 38}px`,
                    width: `${settings.navbarLogoSize || 38}px`
                  }}
                  className="rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-purple-500/20 transition-all"
                >
                  <span className="text-sm font-black text-white">N</span>
                </div>
              )}
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {settings.siteName || 'NightmareMC'}
              </span>
            </Link>

            {/* Desktop Navigation (Zenith Pills) */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-900/80 p-1 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 backdrop-blur-md">
              {enabledNavLinks.map(link => {
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                      isActive
                        ? 'text-white shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/60'
                    )}
                  >
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-600/30 transition-all duration-200"
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              
              {/* Currency Selector */}
              {settings.showCurrencySelector && activeCurrencies.length > 1 && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setIsCurrencyOpen(!isCurrencyOpen);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span>{selectedCurrency?.symbol || '₹'}</span>
                    <span>{selectedCurrency?.code || 'INR'}</span>
                    <ChevronDown
                      className={cn('h-3.5 w-3.5 transition-transform', isCurrencyOpen && 'rotate-180')}
                    />
                  </button>
                  <AnimatePresence>
                    {isCurrencyOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-[#111118] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 p-1"
                      >
                        {activeCurrencies.map(c => (
                          <button
                            key={c.code}
                            onClick={() => {
                              setSelectedCurrency(c);
                              setIsCurrencyOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-colors font-medium',
                              c.code === (selectedCurrency?.code || 'INR')
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                                : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            )}
                          >
                            <span className="font-mono text-xs text-slate-400 dark:text-zinc-500 w-5">{c.symbol}</span>
                            <span>{c.code}</span>
                            <span className="text-slate-400 dark:text-zinc-500 text-[10px] ml-auto">{c.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Working Dark / Light Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </button>

              {/* Audio Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center"
                title={soundActive ? 'Mute Game Audio' : 'Enable Game Audio'}
                aria-label="Toggle game audio"
              >
                {soundActive ? (
                  <Volume2 className="h-4 w-4 text-purple-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {/* Cart Drawer Trigger */}
              {settings.showCart && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center"
                  aria-label="View Cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md shadow-blue-500/30"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </motion.span>
                  )}
                </button>
              )}

              {/* Player Login / In-Game Name Button (Zenith Style) */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02]"
              >
                {player ? (
                  <>
                    <img
                      src={`https://mc-heads.net/avatar/${player.username}/24`}
                      alt={player.username}
                      className="w-5 h-5 rounded-md shrink-0 bg-blue-700"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/24';
                      }}
                    />
                    <span className="max-w-[80px] sm:max-w-[110px] truncate">{player.username}</span>
                  </>
                ) : (
                  <>
                    <User className="h-3.5 w-3.5" />
                    <span>Log In</span>
                  </>
                )}
              </button>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-[70] w-[280px] bg-white dark:bg-[#0e0e17] border-r border-slate-200 dark:border-zinc-800 flex flex-col lg:hidden p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-black text-lg text-slate-900 dark:text-white">
                  {settings.siteName}
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5">
                {enabledNavLinks.map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md"
                >
                  <User className="h-4 w-4" />
                  {player ? player.username : 'Log In (Player IGN)'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
