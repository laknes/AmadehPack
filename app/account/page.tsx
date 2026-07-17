import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GlassPanel } from "@/components/glass-panel";

export const metadata = { title: "پنل کاربری" };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  return (
    <section className="container section">
      <h1 className="mb-8 text-4xl font-black">پنل کاربری</h1>
      <div className="grid gap-5 md:grid-cols-3">
        <GlassPanel><p className="text-[#6F6256]">نام</p><strong className="mt-2 block text-xl">{session?.user?.name}</strong></GlassPanel>
        <GlassPanel><p className="text-[#6F6256]">ایمیل</p><strong className="mt-2 block text-xl">{session?.user?.email}</strong></GlassPanel>
        <GlassPanel><p className="text-[#6F6256]">نقش</p><strong className="mt-2 block text-xl">{session?.user?.role}</strong></GlassPanel>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/orders" className="btn">پیگیری سفارش</Link>
        <Link href="/wishlist" className="btn">علاقه‌مندی‌ها</Link>
        {session?.user?.role === "admin" && <Link href="/admin" className="btn-primary btn">ورود به مدیریت</Link>}
      </div>
    </section>
  );
}

