"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore, type CartProduct } from "@/store/cart-store";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const addItem = useCartStore((state) => state.addItem);
  return <button className="btn-primary btn" onClick={() => addItem(product)}><ShoppingBag size={18} /> افزودن به سبد</button>;
}

