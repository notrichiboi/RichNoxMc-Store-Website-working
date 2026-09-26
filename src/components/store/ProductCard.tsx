'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingCart, ArrowRight, Sparkles, Box, Eye, Images } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useCartContext } from '@/contexts/CartContext';
import { ProductModal } from './ProductModal';
import { KitPreviewModal } from './KitPreviewModal';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectedCurrency } = useCurrencyContext();
  const { addItem } = useCartContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKitPreviewOpen, setIsKitPreviewOpen] = useState(false);

  // Safe pricing extraction supporting both prices dictionary and legacy price
  const prices = product.prices || (product as any).price || {};
  const price = prices[selectedCurrency?.code] ?? prices['INR'] ?? prices['USD'] ?? 0;
  const formattedPrice = price > 0 ? `${selectedCurrency?.symbol || '₹'}${Number(price).toFixed(2)}` : 'Free';

  const isDisabled = product.comingSoon || product.stockStatus === 'comingsoon' || product.stockStatus === 'outofstock';
  const hasKitPreview = Boolean(product.kitPreviewImageUrl && product.kitPreviewImageUrl.trim() !== '');
  const galleryCount = product.galleryImages?.filter(Boolean)?.length || 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    setIsModalOpen(true);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    addItem(product, 1);
    toast.success(`Added ${product.name} to cart!`);
  };

  const handleOpenKitPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsKitPreviewOpen(true);
  };

  const enabledFeatures = product.features?.filter(f => f.enabled) || [];

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl hover:shadow-xl dark:hover:shadow-blue-500/10 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between cursor-pointer overflow-hidden"
      >
        {/* Top Tag, Badges & Kit Preview Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
              ✦ {product.categoryName || 'PACKAGE'}
            </span>

            {product.badge && (
              <span
                className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-sm"
                style={{ backgroundColor: product.badgeColor || '#ec4899' }}
              >
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {galleryCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center gap-1" title={`${galleryCount} additional photos`}>
                <Images className="w-2.5 h-2.5" />
                +{galleryCount}
              </span>
            )}

            {/* In-game Kit Preview Pill on Card */}
            {hasKitPreview && (
              <button
                type="button"
                onClick={handleOpenKitPreview}
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/40 hover:scale-105 transition-transform shadow-xs"
                title="Click to view in-game chest GUI and inventory screenshot"
              >
                <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Kit Preview
              </button>
            )}
          </div>
        </div>

        {/* Center 3D Render / Item Image */}
        <div className="relative w-full h-36 sm:h-44 flex items-center justify-center my-2 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
              onError={e => {
                (e.target as HTMLImageElement).src = 'https://mc-heads.net/head/MHF_Chest';
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Box className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Title and Short Description */}
        <div className="mb-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Features / Perks (Zenith Style Two-Column Checkmarks) */}
        {enabledFeatures.length > 0 && (
          <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100 dark:border-white/5">
            {enabledFeatures.slice(0, 2).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{feat.text}</span>
              </div>
            ))}
            {enabledFeatures.length > 2 && (
              <span className="text-[10px] font-bold text-blue-500/80 dark:text-blue-400 block pt-0.5">
                +{enabledFeatures.length - 2} more benefits
              </span>
            )}
          </div>
        )}

        {/* Bottom Bar: Gold Price Pill + Blue Buy Now Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
          {/* Gold Price Tag (Zenith Signature) */}
          <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-sm tracking-tight shadow-md shadow-amber-400/20">
            {formattedPrice}
          </div>

          {/* Blue Buy Now Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBuyNow}
              disabled={isDisabled}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all hover:scale-105"
            >
              <span>{isDisabled ? 'Unavailable' : 'Buy Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Full Product Details Modal */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Direct In-Game Kit Inventory Preview Modal */}
      <KitPreviewModal
        product={product}
        isOpen={isKitPreviewOpen}
        onClose={() => setIsKitPreviewOpen(false)}
      />
    </>
  );
}
