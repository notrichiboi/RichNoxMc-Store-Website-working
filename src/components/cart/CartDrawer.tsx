'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartContext } from '@/contexts/CartContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { SafeImage } from '../ui/SafeImage';
import { CheckoutModal } from '../checkout/CheckoutModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getTotal, isEmpty } = useCartContext();
  const { selectedCurrency } = useCurrencyContext();

  const currCode = selectedCurrency?.code || 'INR';
  const currSymbol = selectedCurrency?.symbol || '₹';
  const total = getTotal(currCode);
  const formatPrice = (amount: number) =>
    `${currSymbol}${amount.toFixed(2)}`;

  const handleProceedToCheckout = () => {
    onClose();
    setTimeout(() => setIsCheckoutOpen(true), 250);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-[#0e0e18] border-l border-slate-200/90 dark:border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Your Cart
                    </h2>
                    {items.length > 0 && (
                      <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEmpty && (
                    <button
                      onClick={clearCart}
                      className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700">
                {isEmpty ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-zinc-800/60 flex items-center justify-center mb-4">
                      <ShoppingCart className="h-8 w-8 text-slate-400 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                      Your cart is empty
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mb-6 leading-relaxed">
                      Explore our store packages and add items to your cart to get started.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
                    >
                      Browse Store
                    </button>
                  </div>
                ) : (
                  items.map(item => {
                    const itemPrices = item.prices || (item as any).price || {};
                    const itemPrice = itemPrices[currCode] ?? itemPrices['INR'] ?? itemPrices['USD'] ?? 0;
                    return (
                      <div
                        key={item.productId}
                        className="flex gap-3 bg-slate-50 dark:bg-[#131322] border border-slate-200/80 dark:border-white/5 rounded-2xl p-3.5"
                      >
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-zinc-800 shrink-0">
                          <SafeImage src={item.imageUrl} alt={item.productName} fill />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                              {formatPrice(itemPrice)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-white dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700/60 p-0.5">
                              <button
                                onClick={() => updateQuantity(item.productId, item.selectedQuantity - 1)}
                                className="p-1 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                                {item.selectedQuantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.selectedQuantity + 1)}
                                className="p-1 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.productId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {!isEmpty && (
                <div className="p-6 border-t border-slate-100 dark:border-white/10 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Subtotal
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
