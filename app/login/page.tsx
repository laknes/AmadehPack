"use client";

import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(formData: FormData) {
    setError("");
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.ok) {
      const session = await getSession();
      if (session?.user?.role === "admin") {
        router.push("/admin");
        return;
      }
      router.push(params.get("callbackUrl") ?? "/account");
    }
    else setError("ایمیل یا رمز عبور درست نیست.");
  }

  return (
    <section className="container section grid place-items-center">
      <form action={submit} className="glass grid w-full max-w-md gap-4 rounded-[28px] p-6">
        <h1 className="text-3xl font-black">ورود کاربر</h1>
        <input className="field" name="email" type="email" placeholder="ایمیل" defaultValue="admin@amadehpack.local" required />
        <div className="relative">
          <input
            className="field pl-12"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="رمز عبور"
            defaultValue="admin123456"
            required
          />
          <button
            type="button"
            className="absolute left-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[#6F6256] transition hover:bg-[#FFF4DF] hover:text-[#1C1108]"
            aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button className="btn-primary btn">ورود</button>
        {error && <p className="text-rose-200">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link className="text-[#B8874B]" href="/register">حساب ندارید؟ ثبت‌نام کنید</Link>
          <Link className="text-[#B8874B]" href="/forgot-password">رمز عبور را فراموش کرده‌اید؟</Link>
        </div>
      </form>
    </section>
  );
}

