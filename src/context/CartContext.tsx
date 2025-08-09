'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

export interface CartItem {
  id: string;            // product id (문서 id/slug)
  name: string;
  price: number;         // 단가 (항상 숫자)
  image: string;
  size: string;          // 옵션 구분 키 (variant size). 옵션 없으면 'base'
  quantity: number;
  // 확장 필드 (선택)
  variantId?: string | null;
  variantLabel?: string; // "Size M" 등
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  removeFromCart: (id: string, size: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  // 로컬스토리지 연동
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (item: CartItem) => {
    const safeItem: CartItem = {
      ...item,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      size: item.size || 'base',
    };

    setCart(prev => {
      const idx = prev.findIndex(p => p.id === safeItem.id && p.size === safeItem.size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + safeItem.quantity,
          // 가격은 최신으로 유지
          price: safeItem.price,
          variantId: safeItem.variantId ?? next[idx].variantId,
          variantLabel: safeItem.variantLabel ?? next[idx].variantLabel,
        };
        return next;
      }
      return [...prev, safeItem];
    });

    setCartOpen(true);
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    setCart(prev =>
      prev.map(p =>
        p.id === id && p.size === size ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(prev => prev.filter(p => !(p.id === id && p.size === size)));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, isCartOpen, setCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}