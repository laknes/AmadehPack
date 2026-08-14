"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const countries = [
  { code: "+98", name: "ایران", example: "9121234567" },
  { code: "+971", name: "امارات", example: "501234567" },
  { code: "+90", name: "ترکیه", example: "5321234567" },
  { code: "+1", name: "آمریکا / کانادا", example: "2015550123" },
];

function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776));
}

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+98");

  async function submit(formData: FormData) {
    setMessage("");
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");
    if (password !== passwordConfirmation) {
      setMessage("تکرار رمز عبور با رمز عبور یکسان نیست.");
      return;
    }

    const localPhone = toEnglishDigits(String(formData.get("phone") ?? "")).replace(/\D/g, "").replace(/^0+/, "");
    if (!/^\d{7,12}$/.test(localPhone)) {
      setMessage("شماره تماس را با فرمت صحیح وارد کنید.");
      return;
    }

    const payload = Object.fromEntries(formData);
    delete payload.passwordConfirmation;
    delete payload.countryCode;
    payload.phone = `${countryCode}${localPhone}`;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      let result: { error?: string } = {};
      if (text) {
        try {
          result = JSON.parse(text) as { error?: string };
        } catch {
          result = {};
        }
      }
      if (response.ok) router.push("/login");
      else setMessage(result.error ?? "ثبت‌نام ناموفق بود. دوباره تلاش کنید.");
    } catch {
      setMessage("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    }
  }

  return (
    <section className="container section grid place-items-center">
      <form action={submit} className="glass grid w-full max-w-md gap-4 rounded-[28px] p-6">
        <h1 className="text-3xl font-black">ثبت‌نام</h1>
        <input className="field" name="name" placeholder="نام کامل" required />
        <input className="field" name="email" type="email" placeholder="ایمیل" required />
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
        <input className="field" name="password" type="password" placeholder="رمز عبور" minLength={8} required />
        <input className="field" name="passwordConfirmation" type="password" placeholder="تکرار رمز عبور" minLength={8} required />
        <button className="btn-primary btn">ساخت حساب</button>
        {message && <p className="text-rose-200">{message}</p>}
        <Link className="text-[#B8874B]" href="/login">قبلا ثبت‌نام کرده‌اید؟ ورود</Link>
      </form>
    </section>
  );
}

