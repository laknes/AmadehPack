"use client";

import { useEffect, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { GlassPanel } from "@/components/glass-panel";

type EnamadSettings = {
  enabled: boolean;
  trustCode?: string | null;
  badgeHtml?: string | null;
  badgeImageUrl?: string | null;
  profileUrl?: string | null;
};

const defaultSettings: EnamadSettings = {
  enabled: false,
  trustCode: "",
  badgeHtml: "",
  badgeImageUrl: "",
  profileUrl: "https://enamad.ir",
};

export function AdminEnamadForm() {
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch("/api/admin/enamad", { cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json();
      setSettings({ ...defaultSettings, ...result });
    });
  }, []);

  function update<K extends keyof EnamadSettings>(key: K, value: EnamadSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/enamad", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (response.ok) {
        setSettings({ ...defaultSettings, ...result });
        setMessage("تنظیمات اینماد ذخیره شد.");
      } else {
        setMessage("اطلاعات اینماد معتبر نیست.");
      }
    });
  }

  return (
    <GlassPanel>
      <h2 className="mb-5 text-xl font-bold">تنظیمات اینماد</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#B8874B]/20 bg-white px-4">
          <input type="checkbox" checked={settings.enabled} onChange={(event) => update("enabled", event.target.checked)} />
          نمایش نشان اعتماد
        </label>
        <input className="field" value={settings.trustCode ?? ""} onChange={(event) => update("trustCode", event.target.value)} placeholder="کد اعتماد" dir="ltr" />
        <input className="field" value={settings.badgeImageUrl ?? ""} onChange={(event) => update("badgeImageUrl", event.target.value)} placeholder="آدرس تصویر badge" dir="ltr" />
        <input className="field" value={settings.profileUrl ?? ""} onChange={(event) => update("profileUrl", event.target.value)} placeholder="لینک پروفایل اینماد" dir="ltr" />
        <textarea className="field min-h-32 py-3 md:col-span-2" value={settings.badgeHtml ?? ""} onChange={(event) => update("badgeHtml", event.target.value)} placeholder="HTML نشان اینماد" dir="ltr" />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="btn-primary btn" type="button" onClick={save} disabled={isPending}><Save size={18} /> {isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}</button>
        {message && <span className="rounded-2xl bg-[#FFF4DF] px-4 py-3 text-sm text-[#4A2F1B]">{message}</span>}
      </div>
    </GlassPanel>
  );
}
