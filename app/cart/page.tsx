"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, setQuantity, removeItem } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="container section">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[#B8874B]">سبد خرید</p>
          <h1 className="mt-2 text-4xl font-black">مرور سفارش</h1>
        </div>
        <Link href="/shop" className="btn">ادامه خرید <ArrowLeft size={18} /></Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {items.length === 0 && (
            <div className="glass rounded-[28px] p-8 text-center">
              <ShoppingBag className="mx-auto text-[#FF8A1F]" size={34} />
              <h2 className="mt-4 text-2xl font-black">سبد خرید خالی است</h2>
              <p className="mt-3 text-[#6F6256]">از فروشگاه محصول انتخاب کنید یا برای سفارش عمده استعلام بگیرید.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/shop" className="btn-primary btn">مشاهده محصولات</Link>
                <Link href="/contact" className="btn">استعلام عمده</Link>
              </div>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="glass grid gap-4 rounded-[28px] p-4 sm:grid-cols-[110px_1fr_auto]">
              <div className="relative aspect-square rounded-2xl bg-[#FFF4DF]"><Image src={item.image} alt={item.name} fill className="object-contain p-4" /></div>
              <div>
                <Link href={`/product/${item.slug}`} className="text-lg font-bold">{item.name}</Link>
                <p className="mt-2 text-[#6F6256]">{formatPrice(item.price)}</p>
                <p className="mt-2 text-sm text-[#4A2F1B]">جمع ردیف: {formatPrice(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn" onClick={() => setQuantity(item.id, item.quantity + 1)}><Plus size={16} /></button>
                <span className="min-w-8 text-center">{item.quantity}</span>
                <button className="btn" onClick={() => setQuantity(item.id, item.quantity - 1)}><Minus size={16} /></button>
                <button className="btn" onClick={() => removeItem(item.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <aside className="glass h-fit rounded-[28px] p-6">
          <h2 className="text-xl font-bold">خلاصه سفارش</h2>
          <div className="mt-6 grid gap-3 border-b border-[#B8874B]/25 pb-4 text-[#6F6256]">
            <div className="flex justify-between gap-3"><span>تعداد اقلام</span><strong>{count}</strong></div>
            <div className="flex justify-between gap-3"><span>جمع کالاها</span><strong>{formatPrice(total)}</strong></div>
            <div className="flex justify-between gap-3"><span>ارسال</span><strong>در مرحله بعد</strong></div>
          </div>
          {items.length > 0 ? (
            <Link href="/checkout" className="btn-primary btn mt-6 w-full">ادامه تسویه حساب</Link>
          ) : (
            <Link href="/shop" className="btn-primary btn mt-6 w-full">شروع خرید</Link>
          )}
        </aside>
      </div>
    </section>
  );
}

