'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  ShoppingCart, 
  ArrowRight, 
  Check, 
  Shield, 
  Sword, 
  Box, 
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useCartContext } from '@/contexts/CartContext';
import { CheckoutModal } from '../checkout/CheckoutModal';
import toast from 'react-hot-toast';

interface KitPreviewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function KitPreviewModal({ product, isOpen, onClose }: KitPreviewModalProps) {
  const { selectedCurrency } = useCurrencyContext();
  const { addItem } = useCartContext();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const prices = product?.prices || (product as any)?.price || {};
  const currCode = selectedCurrency?.code || 'INR';
  const currSymbol = selectedCurrency?.symbol || '₹';
  const price = prices[currCode] ?? prices['INR'] ?? prices['USD'] ?? 0;
  const formattedPrice = price > 0 ? `${currSymbol}${Number(price).toFixed(2)}` : 'Free';

  const isDisabled = product.comingSoon || product.stockStatus === 'comingsoon' || product.stockStatus === 'outofstock';

  const handleAddToCart = () => {
    if (isDisabled) return;
    addItem(product, 1);
    toast.success(`Added ${product.name} to cart!`);
    onClose();
  };

  const handleBuyNow = () => {
    if (isDisabled) return;
    addItem(product, 1);
    onClose();
    setTimeout(() => setIsCheckoutOpen(true), 250);
  };

  const toggleZoom = () => {
    setZoomLevel(prev => (prev === 1 ? 1.6 : prev === 1.6 ? 2.2 : 1));
  };

  const previewImage = product.kitPreviewImageUrl || product.imageUrl;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Card - Authentic Minecraft Inventory/Chest Theme */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0d0d15] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.18)] z-10 flex flex-col text-white"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-20"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header: Kit Title & Server Tag */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pr-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      IN-GAME KIT / INVENTORY PREVIEW
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {product.categoryName || 'KIT'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Live screenshot preview of the in-game chest GUI and kit contents given upon redemption.
                  </p>
                </div>

                {/* Price Pill */}
                <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-base shadow-lg shadow-amber-400/20">
                  {formattedPrice}
                </div>
              </div>

              {/* Zoom & Inspection Controls */}
              <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-2xl mb-3 text-xs">
                <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-amber-400" />
                  Chest GUI Inspection Mode
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                    Zoom: {zoomLevel}x
                  </span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(1, +(prev - 0.3).toFixed(1)))}
                    disabled={zoomLevel <= 1}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(2.5, +(prev + 0.3).toFixed(1)))}
                    disabled={zoomLevel >= 2.5}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={toggleZoom}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition-colors flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" />
                    {zoomLevel === 1 ? 'Expand' : 'Reset'}
                  </button>
                </div>
              </div>

              {/* Main Screenshot Container - Stylized Minecraft Chest Frame */}
              <div className="relative w-full min-h-[260px] sm:min-h-[380px] max-h-[550px] bg-[#07070b] border-2 border-zinc-800 rounded-2xl overflow-auto flex items-center justify-center p-3 select-none">
                {/* Background grid pattern simulating Minecraft inventory slots */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />

                {previewImage && !imageError ? (
                  <motion.div
                    animate={{ scale: zoomLevel }}
                    transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                    className="cursor-zoom-in max-w-full flex items-center justify-center"
                    onClick={toggleZoom}
                  >
                    <img
                      src={previewImage}
                      alt={`${product.name} In-Game Kit Preview`}
                      className="max-h-[500px] w-auto object-contain rounded-xl shadow-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                      onError={() => setImageError(true)}
                    />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <Box className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">In-Game Inventory Screenshot</h4>
                      <p className="text-xs text-zinc-400 max-w-md mt-1">
                        Screenshot preview will appear here once configured by server admins in the admin panel.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Itemized Kit Contents Breakdown */}
              {product.kitContents && product.kitContents.length > 0 && (
                <div className="mt-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Sword className="w-3.5 h-3.5" />
                      Kit Contents List ({product.kitContents.length} Items)
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Hover to inspect items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {product.kitContents.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#09090e] border border-zinc-800 hover:border-amber-500/40 px-3 py-2 rounded-xl text-xs text-zinc-200 transition-colors"
                      >
                        <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-zinc-400 text-center sm:text-left">
                  Items are immediately granted in-game upon order delivery confirmation.
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={isDisabled}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isDisabled}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-500/30 transition-all hover:scale-105 flex items-center justify-center gap-1.5"
                  >
                    <span>Buy Kit Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
