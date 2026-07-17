"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const result = await response.json();

    setMessage(result.message ?? "درخواست بازیابی ثبت شد.");
    setPending(false);
  }

  return (
    <section className="container section grid place-items-center">
      <form action={submit} className="glass grid w-full max-w-md gap-4 rounded-[28px] p-6">
        <h1 className="text-3xl font-black">بازیابی رمز عبور</h1>
        <p className="leading-8 text-[#6F6256]">ایمیل حساب کاربری خود را وارد کنید تا راهنمای بازیابی رمز عبور برایتان ارسال شود.</p>
        <input className="field" name="email" type="email" placeholder="ایمیل" required />
        <button className="btn-primary btn" disabled={pending}>{pending ? "در حال ارسال..." : "ارسال راهنمای بازیابی"}</button>
        {message && <p className="rounded-2xl border border-[#B8874B]/30 bg-[#FFF4DF] p-3 text-sm leading-7 text-[#4A2F1B]">{message}</p>}
        <Link className="text-sm text-[#B8874B]" href="/login">بازگشت به ورود</Link>
      </form>
    </section>
  );
}
