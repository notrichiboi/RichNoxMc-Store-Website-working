'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';

import { playItemPickupSound, playClickSound } from '@/lib/utils/audio';

const CART_KEY = 'nightmaremc_cart';

export interface CartState {
  items: CartItem[];
  totalItems: number;
  isEmpty: boolean;
}

export interface CartActions {
  addItem: (product: Product, selectedQuantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: (currencyCode: string) => number;
}

export type UseCartReturn = CartState & CartActions;

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Silently ignore parse errors
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = useCallback((product: Product, selectedQuantity = 1) => {
    try {
      playItemPickupSound();
    } catch {}
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, selectedQuantity: item.selectedQuantity + selectedQuantity }
            : item
        );
      }
      const normalizedPrices = product.prices || (product as any).price || { INR: 0, USD: 0 };
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        categoryName: product.categoryName,
        quantity: 1, // unit quantity (not selected)
        selectedQuantity,
        prices: normalizedPrices,
        badge: product.badge,
      };
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    try {
      playClickSound();
    } catch {}
    setItems(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.productId !== productId));
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, selectedQuantity: quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback((currencyCode: string): number => {
    return items.reduce((sum, item) => {
      const p = item.prices || (item as any).price || {};
      const price = p[currencyCode] ?? p['INR'] ?? p['USD'] ?? 0;
      return sum + (typeof price === 'number' ? price : 0) * item.selectedQuantity;
    }, 0);
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.selectedQuantity, 0);
  const isEmpty = items.length === 0;

  return {
    items,
    totalItems,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
  };
}
