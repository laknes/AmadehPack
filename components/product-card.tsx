"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3, Heart, PackageCheck, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

type Product = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  sku: string;
  unit?: string;
  minOrder?: string;
  leadTime?: string;
};

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <motion.article whileHover={{ y: -8, rotateX: 2 }} className="glass group overflow-hidden rounded-[28px] p-4">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#FFF4DF]">
          <Image src={product.image} alt={product.name} fill className="object-contain p-8 transition duration-500 group-hover:scale-110" />
        </div>
        <div className="pt-5">
          <p className="text-xs text-[#B8874B]">{product.sku}</p>
          <h3 className="mt-2 min-h-12 text-lg font-bold leading-7">{product.name}</h3>
          <p className="mt-3 text-[#4A2F1B]">{formatPrice(product.price)}</p>
          {product.unit && <p className="mt-1 text-xs text-[#6F6256]">{product.unit}</p>}
        </div>
      </Link>
      <div className="mt-4 grid gap-2 text-xs text-[#6F6256]">
        {product.minOrder && (
          <span className="flex items-center gap-2">
            <PackageCheck size={15} className="text-[#005D21]" />
            حداقل سفارش: {product.minOrder}
          </span>
        )}
        {product.leadTime && (
          <span className="flex items-center gap-2">
            <Clock3 size={15} className="text-[#FF8A1F]" />
            {product.leadTime}
          </span>
        )}
      </div>
      <div className="mt-5 flex gap-2">
        <button className="btn-primary btn flex-1" onClick={() => addItem(product)}><ShoppingBag size={18} /> افزودن</button>
        <Link className="btn" href="/wishlist" aria-label="افزودن به علاقه‌مندی"><Heart size={18} /></Link>
      </div>
    </motion.article>
  );
}


