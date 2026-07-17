"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { products } from "@/lib/data";

export function ContactForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const selectedProduct = useMemo(() => {
    const slug = searchParams.get("product");
    return products.find((product) => product.slug === slug);
  }, [searchParams]);

  return (
    <form
      className="glass grid gap-4 rounded-[28px] p-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <p className="text-[#B8874B]">فرم استعلام</p>
        <h1 className="mt-2 text-3xl font-black">تماس با فروش</h1>
      </div>
      <input className="field" name="fullName" placeholder="نام کامل" required />
      <input className="field" name="phone" placeholder="شماره تماس" required />
      <select className="field" name="requestType" defaultValue={selectedProduct ? "print" : "bulk"} required>
        <option value="bulk">استعلام سفارش عمده</option>
        <option value="print">چاپ اختصاصی</option>
        <option value="support">پشتیبانی سفارش</option>
        <option value="partnership">همکاری و تامین</option>
      </select>
      <input className="field" name="product" placeholder="محصول موردنظر" defaultValue={selectedProduct?.name ?? ""} />
      <input className="field" name="quantity" placeholder="تیراژ یا تعداد تقریبی" />
      <textarea className="field min-h-32 py-3" name="message" placeholder="پیام شما" required />
      <button className="btn-primary btn" type="submit">
        ارسال درخواست
        <Send size={18} />
      </button>
      {submitted && (
        <p className="rounded-2xl border border-[#005D21]/20 bg-[#E7EFE2] p-4 text-sm leading-7 text-[#24532B]">
          درخواست شما ثبت شد. تیم فروش آماده‌پک برای نهایی کردن قیمت، زمان آماده‌سازی و شرایط چاپ با شما تماس می‌گیرد.
        </p>
      )}
    </form>
  );
}
