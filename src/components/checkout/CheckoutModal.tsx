'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, ExternalLink, AlertTriangle,
  ArrowLeft, ArrowRight, X, MessageSquare,
  Info, ShoppingCart
} from 'lucide-react';
import { useCartContext } from '@/contexts/CartContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { SafeImage } from '../ui/SafeImage';
import toast from 'react-hot-toast';
import { playLevelUpSound, playClickSound } from '@/lib/utils/audio';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'cart' | 'info' | 'discord';

const STEP_TITLES: Record<Step, string> = {
  cart: 'COMPLETE YOUR PURCHASE',
  info: 'MINECRAFT INFORMATION',
  discord: 'READY TO CONTINUE?',
};

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('cart');
  const { player } = usePlayerContext();
  const [edition, setEdition] = useState<'Java' | 'Bedrock'>('Java');
  const [username, setUsername] = useState('');
  const [copied, setCopied] = useState(false);

  const { items, getTotal, clearCart } = useCartContext();
  const { selectedCurrency } = useCurrencyContext();
  const { settings } = useSettingsContext();

  useEffect(() => {
    if (player) {
      setEdition(player.edition);
      setUsername(player.username);
    }
  }, [player, isOpen]);

  const currCode = selectedCurrency?.code || 'INR';
  const currSymbol = selectedCurrency?.symbol || '₹';

  const formatPrice = (amount: number) =>
    `${currSymbol}${amount.toFixed(2)}`;

  const total = getTotal(currCode);

  const generateMessage = (): string => {
    const template =
      settings?.discordMessageTemplate ||
      `Hello NightmareMC Staff! 👋

I would like to purchase:

{{cart_items}}

Minecraft Edition: {{edition}}
Minecraft Username: {{username}}
Currency: {{currency}}
Displayed Store Total: {{total}}

Please confirm the final amount and payment instructions.

Thank you!`;

    const cartItemsText = items
      .map(item => `• ${item.productName} ×${item.selectedQuantity}`)
      .join('\n');

    return template
      .replace('{{cart_items}}', cartItemsText)
      .replace('{{edition}}', edition)
      .replace('{{username}}', username || 'Not provided')
      .replace('{{currency}}', currCode)
      .replace('{{total}}', formatPrice(total))
      .replace('{{site_name}}', settings?.siteName || 'NightmareMC');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMessage());
      setCopied(true);
      playLevelUpSound();
      toast.success('Message copied! Paste it into your NightmareMC Discord ticket.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy. Please copy the message manually.');
    }
  };

  const handleOpenDiscord = () => {
    if (!copied) {
      toast('Copy the message first, then paste it in Discord!', { icon: '⚠️' });
    }
    const discordUrl = settings?.discordUrl || 'https://discord.gg/nightmaremc';
    window.open(discordUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setStep('cart');
    setCopied(false);
    onClose();
  };

  const stepIndex: Record<Step, number> = { cart: 0, info: 1, discord: 2 };
  const currentIndex = stepIndex[step];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {STEP_TITLES[step]}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Progress bar */}
            <div className="flex gap-2">
              {(['cart', 'info', 'discord'] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i <= currentIndex ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700">
            <AnimatePresence mode="wait">
              {/* Step 1: Cart Review */}
              {step === 'cart' && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                      Order Summary
                    </h3>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {items.map(item => {
                        const itemPrices = item.prices || (item as any).price || {};
                        const itemPrice = itemPrices[currCode] ?? itemPrices['INR'] ?? itemPrices['USD'] ?? 0;
                        return (
                          <div
                            key={item.productId}
                            className="flex items-center gap-3 bg-slate-50 dark:bg-[#131322] rounded-2xl p-3 border border-slate-200/80 dark:border-white/5"
                          >
                            <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-slate-200 dark:bg-zinc-800 shrink-0">
                              <SafeImage src={item.imageUrl} alt={item.productName} fill />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {item.productName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Qty: {item.selectedQuantity}
                              </p>
                            </div>
                            <p className="text-sm font-black text-slate-900 dark:text-white shrink-0">
                              {formatPrice(itemPrice * item.selectedQuantity)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between py-3 border-t border-b border-slate-100 dark:border-white/10">
                    <span className="text-slate-600 dark:text-zinc-400 font-semibold">Total (Displayed)</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatPrice(total)}</span>
                  </div>

                  {/* Manual process info */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-4 flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                      <p className="font-bold text-blue-700 dark:text-blue-300 mb-1">Manual Purchase Process</p>
                      <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                        NightmareMC processes all orders manually through Discord tickets. Next, you will generate a formatted order message to send directly to staff.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setStep('info')}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all"
                    >
                      CONTINUE <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Minecraft Info */}
              {step === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                    This information is only used to generate your Discord order message. It is <strong className="text-slate-900 dark:text-white">not stored in any database</strong>.
                  </div>

                  {/* Edition selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Minecraft Edition
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Java', 'Bedrock'] as const).map(ed => (
                        <button
                          key={ed}
                          onClick={() => setEdition(ed)}
                          className={`py-3.5 rounded-2xl border text-sm font-bold transition-all ${
                            edition === ed
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md'
                              : 'bg-white dark:bg-[#131322] border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                          }`}
                        >
                          {ed} Edition
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Minecraft Username <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your exact in-game name"
                      maxLength={16}
                      className="w-full bg-slate-50 dark:bg-[#131322] border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setStep('cart')}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> BACK
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep('discord')}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors"
                      >
                        SKIP
                      </button>
                      <button
                        onClick={() => setStep('discord')}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all"
                      >
                        CONTINUE <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Discord Message */}
              {step === 'discord' && (
                <motion.div
                  key="discord"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mb-3">
                      Your order is ready. Follow these quick steps to complete your purchase:
                    </p>
                    <ol className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                      {[
                        'Copy the message below.',
                        'Open the NightmareMC Discord.',
                        'Create a purchase or support ticket.',
                        'Paste the copied message into the ticket.',
                        'Wait for staff to confirm final amount and send instructions.',
                      ].map((sText, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{sText}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-3.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                      Never send payment before a staff member confirms the final amount in your ticket.
                    </p>
                  </div>

                  {/* Discord Message Box */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> YOUR DISCORD MESSAGE
                      </span>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          copied
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                        }`}
                      >
                        {copied ? <><Check className="h-3.5 w-3.5" /> COPIED</> : <><Copy className="h-3.5 w-3.5" /> COPY</>}
                      </button>
                    </div>

                    <pre className="p-4 rounded-2xl bg-slate-100 dark:bg-[#080811] border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {generateMessage()}
                    </pre>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={handleCopy}
                      className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                        copied
                          ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30'
                      }`}
                    >
                      {copied ? <><Check className="h-4 w-4" /> MESSAGE COPIED!</> : <><Copy className="h-4 w-4" /> COPY MESSAGE</>}
                    </button>

                    <button
                      onClick={handleOpenDiscord}
                      className="w-full py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5865F2]/25"
                    >
                      <ExternalLink className="h-4 w-4" />
                      OPEN DISCORD
                    </button>

                    <div className="text-center pt-1">
                      <button
                        onClick={() => setStep('info')}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        ← Back to info
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
