"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const result = await response.json();
    if (response.ok) router.push("/login");
    else setMessage(result.error ?? "ثبت‌نام ناموفق بود");
  }

  return (
    <section className="container section grid place-items-center">
      <form action={submit} className="glass grid w-full max-w-md gap-4 rounded-[28px] p-6">
        <h1 className="text-3xl font-black">ثبت‌نام</h1>
        <input className="field" name="name" placeholder="نام کامل" required />
        <input className="field" name="email" type="email" placeholder="ایمیل" required />
        <input className="field" name="phone" placeholder="شماره موبایل" />
        <input className="field" name="password" type="password" placeholder="رمز عبور" required />
        <button className="btn-primary btn">ساخت حساب</button>
        {message && <p className="text-rose-200">{message}</p>}
        <Link className="text-[#B8874B]" href="/login">قبلا ثبت‌نام کرده‌اید؟ ورود</Link>
      </form>
    </section>
  );
}

