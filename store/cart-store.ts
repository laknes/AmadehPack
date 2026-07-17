"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

type CartItem = CartProduct & { quantity: number };

type CartState = {
  items: CartItem[];
  addItem: (product: CartProduct) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const found = state.items.find((item) => item.id === product.id);
          if (found) {
            return { items: state.items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)) };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({ items: state.items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)) })),
      clear: () => set({ items: [] }),
    }),
    { name: "amadeh-pack-cart" },
  ),
);
