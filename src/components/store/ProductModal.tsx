'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Box, 
  ArrowRight, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Images, 
  Sparkles,
  Sword,
  Maximize2
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useCartContext } from '@/contexts/CartContext';
import { CheckoutModal } from '../checkout/CheckoutModal';
import { KitPreviewModal } from './KitPreviewModal';
import toast from 'react-hot-toast';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { selectedCurrency } = useCurrencyContext();
  const { addItem } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isKitPreviewOpen, setIsKitPreviewOpen] = useState(false);

  const isComingSoon = product.comingSoon || product.stockStatus === 'comingsoon';
  const isOutOfStock = product.stockStatus === 'outofstock';
  const isDisabled = isComingSoon || isOutOfStock;

  // Safe pricing extraction
  const prices = product?.prices || (product as any)?.price || {};
  const currCode = selectedCurrency?.code || 'INR';
  const currSymbol = selectedCurrency?.symbol || '₹';
  const price = prices[currCode] ?? prices['INR'] ?? prices['USD'] ?? 0;
  const formattedPrice = price > 0 ? `${currSymbol}${(price * quantity).toFixed(2)}` : 'Free';
  const unitPrice = price > 0 ? `${currSymbol}${Number(price).toFixed(2)}` : 'Free';

  // Aggregate all gallery images + main image + kit preview screenshot
  const galleryItems = useMemo(() => {
    const list: { url: string; label: string; isKit?: boolean }[] = [];
    if (product.imageUrl && product.imageUrl.trim()) {
      list.push({ url: product.imageUrl.trim(), label: 'Main Artwork' });
    }
    if (product.galleryImages && Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach((img, idx) => {
        if (img && typeof img === 'string' && img.trim()) {
          list.push({ url: img.trim(), label: `Gallery #${idx + 1}` });
        }
      });
    }
    if (product.kitPreviewImageUrl && product.kitPreviewImageUrl.trim()) {
      list.push({ url: product.kitPreviewImageUrl.trim(), label: '🎒 Kit Inventory Preview', isKit: true });
    }
    return list;
  }, [product.imageUrl, product.galleryImages, product.kitPreviewImageUrl]);

  const activeImage = galleryItems[activeImageIndex] || galleryItems[0];
  const hasMultipleImages = galleryItems.length > 1;
  const hasKitPreview = Boolean(product.kitPreviewImageUrl && product.kitPreviewImageUrl.trim() !== '');

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (isDisabled) return;
    addItem(product, quantity);
    toast.success(`Added ${quantity}× ${product.name} to cart!`);
    onClose();
    setQuantity(1);
  };

  const handleBuyNowDirect = () => {
    if (isDisabled) return;
    addItem(product, quantity);
    onClose();
    setTimeout(() => setIsCheckoutOpen(true), 250);
  };

  const enabledFeatures = product.features?.filter(f => f.enabled) || [];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Card (Zenith Popup) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#11111a] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl z-10 flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors z-20"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Category Pill Tag & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                  ✦ {product.categoryName || 'PACKAGE'}
                </span>
                {product.badge && (
                  <span
                    className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: product.badgeColor || '#ec4899' }}
                  >
                    {product.badge}
                  </span>
                )}
                {hasKitPreview && (
                  <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Kit Preview Available
                  </span>
                )}
              </div>

              {/* Interactive Image Gallery Viewport */}
              <div className="relative w-full h-52 sm:h-64 rounded-2xl bg-slate-50 dark:bg-[#08080f] border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-center p-3 my-2 overflow-hidden group">
                {activeImage?.url ? (
                  <img
                    src={activeImage.url}
                    alt={product.name}
                    className="max-h-full max-w-[85%] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] transition-all duration-300"
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'https://mc-heads.net/head/MHF_Chest';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
                    <Box className="w-12 h-12 text-white" />
                  </div>
                )}

                {/* Left/Right Carousel Controls */}
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/80 dark:bg-black/70 hover:bg-white dark:hover:bg-black text-slate-700 dark:text-white shadow-md backdrop-blur-sm transition-all opacity-80 hover:opacity-100"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/80 dark:bg-black/70 hover:bg-white dark:hover:bg-black text-slate-700 dark:text-white shadow-md backdrop-blur-sm transition-all opacity-80 hover:opacity-100"
                      title="Next Image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-2.5 right-3 px-2.5 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-mono backdrop-blur-sm border border-white/10">
                      {activeImageIndex + 1} / {galleryItems.length}
                    </div>
                  </>
                )}

                {/* Kit Preview Tag if viewing Kit Screenshot */}
                {activeImage?.isKit && (
                  <div className="absolute top-2.5 left-3 px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    🎒 In-Game Kit Screenshot
                  </div>
                )}
              </div>

              {/* Thumbnails Strip (When multiple gallery images exist) */}
              {hasMultipleImages && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
                  {galleryItems.map((item, idx) => {
                    const isActive = idx === activeImageIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-xl border shrink-0 overflow-hidden p-1 flex items-center justify-center transition-all ${
                          isActive
                            ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/10'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 opacity-70 hover:opacity-100'
                        }`}
                        title={item.label}
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          className="max-h-full max-w-full object-contain"
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'https://mc-heads.net/head/MHF_Chest';
                          }}
                        />
                        {item.isKit && (
                          <div className="absolute inset-x-0 bottom-0 bg-amber-500 text-[8px] font-black text-slate-950 text-center py-0.2">
                            KIT
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Title & Price Row */}
              <div className="mt-3 mb-4">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    {unitPrice}
                  </span>
                  {quantity > 1 && (
                    <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                      (Total: {formattedPrice})
                    </span>
                  )}
                </div>
              </div>

              {/* Dedicated "Inspect In-Game Kit / Inventory" Action Banner */}
              {hasKitPreview && (
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                        In-Game Kit Inventory Preview
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                        Inspect real screenshot of the chest GUI and all included items
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsKitPreviewOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={handleBuyNowDirect}
                  disabled={isDisabled}
                  className="flex-1 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <span>{isDisabled ? 'Currently Unavailable' : 'Buy Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {product.quantityEnabled && !isDisabled && (
                  <div className="flex items-center bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={isDisabled}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>

              {/* Package Description Section (Zenith Style) */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-4">
                <h4 className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  PACKAGE DESCRIPTION
                </h4>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed space-y-2">
                  <p>{product.fullDescription || product.shortDescription}</p>
                </div>

                {/* Features Checklist */}
                {enabledFeatures.length > 0 && (
                  <div className="pt-2 space-y-2">
                    {enabledFeatures.map(feat => (
                      <div key={feat.id} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-200">
                        <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{feat.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bundle Items */}
                {product.isBundle && product.bundleItems && product.bundleItems.length > 0 && (
                  <div className="bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 mt-3 space-y-1.5">
                    <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                      Includes the following:
                    </p>
                    {product.bundleItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                        <span>• {item.productName}</span>
                        <span className="font-bold text-slate-400 dark:text-zinc-500">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Itemized Kit contents list */}
                {product.kitContents && product.kitContents.length > 0 && (
                  <div className="bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sword className="w-3 h-3" />
                        Kit Contents ({product.kitContents.length} Items):
                      </p>
                      {hasKitPreview && (
                        <button
                          type="button"
                          onClick={() => setIsKitPreviewOpen(true)}
                          className="text-[10px] font-bold text-amber-500 hover:underline"
                        >
                          View In-Game Chest ↗
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.kitContents.map((k, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-xl text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone Fullscreen Kit Preview Modal */}
      <KitPreviewModal
        product={product}
        isOpen={isKitPreviewOpen}
        onClose={() => setIsKitPreviewOpen(false)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
