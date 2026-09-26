'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCart, type UseCartReturn } from '../lib/hooks/useCart';

export const CartContext = createContext<UseCartReturn | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

// Safe fallback — prevents navigation crashes when context is momentarily unavailable
const EMPTY_CART: UseCartReturn = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  getTotal: () => 0,
  isEmpty: true,
};

export function useCartContext(): UseCartReturn {
  return useContext(CartContext) ?? EMPTY_CART;
}
