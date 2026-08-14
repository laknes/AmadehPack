"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, LayoutDashboard, Search, ShoppingBag, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { categories } from "@/lib/data";

const nav = [
  ["خانه", "/"],
  ["فروشگاه", "/shop"],
  ["مجله", "/blog"],
  ["درباره", "/about"],
  ["تماس", "/contact"],
];

export function SiteHeader() {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const { data } = useSession();

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-[#B8874B]/35 bg-white backdrop-blur-2xl"
    >
      <div className="container">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#8B5A2B] font-black text-[#FFF4DF]">KP</span>
            <span>
              <strong className="block text-lg">کرافت پک</strong>
              <small className="text-[#6F6256]">Kraft Food Packaging</small>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full px-4 py-2 text-sm text-[#4A2F1B] hover:bg-[#FFF4DF] hover:text-[#1C1108]">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link className="btn hidden sm:inline-flex" href="/shop" aria-label="جستجو"><Search size={18} /></Link>
            <Link className="btn" href="/wishlist" aria-label="علاقه‌مندی‌ها"><Heart size={18} /></Link>
            <Link className="btn relative" href="/cart" aria-label="سبد خرید">
              <ShoppingBag size={18} />
              {count > 0 && <span className="absolute -top-2 -left-2 grid size-6 place-items-center rounded-full bg-[#8B5A2B] text-xs font-bold text-[#FFF4DF]">{count}</span>}
            </Link>
            {data?.user?.role === "admin" && <Link className="btn" href="/admin" aria-label="مدیریت"><LayoutDashboard size={18} /></Link>}
            <Link className="btn-primary btn" href={data ? "/account" : "/login"}><UserRound size={18} />{data ? "پنل" : "ورود"}</Link>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-[#B8874B]/20 py-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="shrink-0 rounded-full border border-[#B8874B]/25 bg-[#F7F1E3] px-4 py-2 text-sm font-medium text-[#4A2F1B] transition hover:border-[#8B5A2B] hover:bg-white"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}


