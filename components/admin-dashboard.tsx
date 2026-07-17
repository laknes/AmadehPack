"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/glass-panel";

type DashboardStats = {
  products: number;
  orders: number;
  users: number;
};

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ products: 0, orders: 0, users: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "failed");
        setStats(result);
      })
      .catch(() => setError("دریافت آمار ناموفق بود."));
  }, []);

  const cards = [
    ["محصولات", stats.products],
    ["سفارش‌ها", stats.orders],
    ["کاربران", stats.users],
  ];

  return (
    <div>
      {error && <p className="mb-5 rounded-2xl bg-[#FFF4DF] p-4 text-[#4A2F1B]">{error}</p>}
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <GlassPanel key={label}><p className="text-[#6F6256]">{label}</p><strong className="mt-2 block text-3xl">{value}</strong></GlassPanel>
        ))}
      </div>
      <GlassPanel className="mt-6">
        <h2 className="text-xl font-bold">وضعیت سیستم</h2>
        <div className="mt-5 grid gap-3 text-[#6F6256]">
          <p>آمار از دیتابیس خوانده می‌شود و با تغییر سفارش‌ها، محصولات و کاربران به‌روزرسانی می‌شود.</p>
          <p>برای جزئیات هر بخش از منوی مدیریت استفاده کنید.</p>
        </div>
      </GlassPanel>
    </div>
  );
}
