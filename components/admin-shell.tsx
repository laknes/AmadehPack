import Link from "next/link";
import { BadgeCheck, Boxes, ChartNoAxesCombined, CreditCard, Images, KeyRound, ListChecks, MessageSquare, Newspaper, PackageSearch, Percent, Settings, Shield, ShoppingCart, Users } from "lucide-react";

const links = [
  ["داشبورد", "/admin", ChartNoAxesCombined],
  ["محصولات", "/admin/products", PackageSearch],
  ["دسته‌بندی‌ها", "/admin/categories", Boxes],
  ["موجودی", "/admin/inventory", ListChecks],
  ["سفارش‌ها", "/admin/orders", ShoppingCart],
  ["کاربران", "/admin/users", Users],
  ["تخفیف‌ها", "/admin/coupons", Percent],
  ["درگاه پرداخت", "/admin/payment-gateways", CreditCard],
  ["اینماد", "/admin/enamad", BadgeCheck],
  ["بنرها", "/admin/banners", Images],
  ["نظرات", "/admin/reviews", MessageSquare],
  ["بلاگ", "/admin/blog", Newspaper],
  ["تنظیمات", "/admin/settings", Settings],
  ["نقش‌ها", "/admin/roles", KeyRound],
  ["لاگ مدیران", "/admin/activity", Shield],
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="container section">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[#B8874B]">مدیریت آماده‌پک</p>
          <h1 className="mt-2 text-4xl font-black">{title}</h1>
        </div>
        <Link href="/" className="btn">بازگشت سایت</Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass h-fit rounded-[28px] p-3">
          {links.map(([label, href, Icon]) => (
            <Link key={String(href)} href={href as string} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[#6F6256] hover:bg-[#FFF4DF] hover:text-[#1C1108]">
              <Icon size={18} />
              {label as string}
            </Link>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </section>
  );
}


