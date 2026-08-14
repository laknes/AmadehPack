"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { products } from "@/lib/data";

const countries = [
  { code: "+98", name: "ایران", example: "9121234567" },
  { code: "+971", name: "امارات", example: "501234567" },
  { code: "+90", name: "ترکیه", example: "5321234567" },
  { code: "+1", name: "آمریکا / کانادا", example: "2015550123" },
];

function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776));
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+98");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedProduct = useMemo(() => {
    const slug = searchParams.get("product");
    return products.find((product) => product.slug === slug);
  }, [searchParams]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitted(false);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const localPhone = toEnglishDigits(String(formData.get("phone") ?? "")).replace(/\D/g, "").replace(/^0+/, "");
    if (!/^\d{7,12}$/.test(localPhone)) {
      setMessage("شماره تماس را با فرمت صحیح وارد کنید.");
      return;
    }

    const payload = Object.fromEntries(formData);
    delete payload.countryCode;
    payload.phone = `${countryCode}${localPhone}`;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      let result: { error?: string; message?: string } = {};
      if (text) {
        try {
          result = JSON.parse(text) as { error?: string; message?: string };
        } catch {
          result = {};
        }
      }
      if (!response.ok) {
        setMessage(result.error ?? "ارسال درخواست ناموفق بود. دوباره تلاش کنید.");
        return;
      }
      setSubmitted(true);
      form.reset();
      setCountryCode("+98");
    } catch {
      setMessage("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="glass grid gap-4 rounded-[28px] p-6" onSubmit={submit}>
      <div>
        <p className="text-[#B8874B]">فرم استعلام</p>
        <h1 className="mt-2 text-3xl font-black">تماس با فروش</h1>
      </div>
      <input className="field" name="fullName" placeholder="نام کامل" required />
      <div className="grid grid-cols-[minmax(130px,0.8fr)_minmax(0,1.5fr)] gap-2">
        <select className="field" name="countryCode" value={countryCode} onChange={(event) => setCountryCode(event.target.value)} aria-label="کد کشور">
          {countries.map((country) => <option key={country.code} value={country.code}>{country.name} ({country.code})</option>)}
        </select>
        <input
          className="field"
          name="phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9۰-۹]{7,12}"
          placeholder={countries.find((country) => country.code === countryCode)?.example}
          title="شماره را بدون صفر ابتدایی و فقط با ارقام وارد کنید"
          required
        />
      </div>
      <select className="field" name="requestType" defaultValue={selectedProduct ? "print" : "bulk"} required>
        <option value="bulk">استعلام سفارش عمده</option>
        <option value="print">چاپ اختصاصی</option>
        <option value="support">پشتیبانی سفارش</option>
        <option value="partnership">همکاری و تامین</option>
      </select>
      <input className="field" name="product" placeholder="محصول موردنظر" defaultValue={selectedProduct?.name ?? ""} />
      <input className="field" name="quantity" placeholder="تیراژ یا تعداد تقریبی" />
      <textarea className="field min-h-32 py-3" name="message" placeholder="پیام شما" required />
      <button className="btn-primary btn" type="submit" disabled={isSubmitting}>
        ارسال درخواست
        <Send size={18} />
      </button>
      {message && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-7 text-rose-700">{message}</p>}
      {submitted && (
        <p className="rounded-2xl border border-[#005D21]/20 bg-[#E7EFE2] p-4 text-sm leading-7 text-[#24532B]">
          درخواست شما ثبت شد. تیم فروش کرافت پک برای نهایی کردن قیمت، زمان آماده‌سازی و شرایط چاپ با شما تماس می‌گیرد.
        </p>
      )}
    </form>
  );
}
