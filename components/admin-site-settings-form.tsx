"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { GlassPanel } from "@/components/glass-panel";
import { formatPrice } from "@/lib/utils";
import type { ShippingMethod, SiteSettings } from "@/lib/site-settings-defaults";

const paymentProviders = ["MOCK", "ZARINPAL", "IDPAY", "PAYIR", "SEP", "BEHPARDAKHT", "SADAD"];

const emptyMethod = (index: number): ShippingMethod => ({
  id: `shipping-${index + 1}`,
  title: "",
  description: "",
  price: 0,
  enabled: true,
});

export function AdminSiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  function updateAppearance(key: keyof SiteSettings["appearance"], value: string) {
    setSettings((current) => ({ ...current, appearance: { ...current.appearance, [key]: value } }));
  }

  function updateGeneral(key: keyof Pick<SiteSettings, "siteName" | "supportPhone" | "supportEmail" | "address" | "seoTitle" | "seoDescription">, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateMethod(index: number, patch: Partial<ShippingMethod>) {
    setSettings((current) => ({
      ...current,
      shipping: {
        ...current.shipping,
        methods: current.shipping.methods.map((method, methodIndex) => (methodIndex === index ? { ...method, ...patch } : method)),
      },
    }));
  }

  function addMethod() {
    setSettings((current) => ({
      ...current,
      shipping: {
        ...current.shipping,
        methods: [...current.shipping.methods, emptyMethod(current.shipping.methods.length)],
      },
    }));
  }

  function removeMethod(index: number) {
    setSettings((current) => {
      const methods = current.shipping.methods.filter((_, methodIndex) => methodIndex !== index);
      return {
        ...current,
        shipping: {
          defaultMethodId: methods.some((method) => method.id === current.shipping.defaultMethodId) ? current.shipping.defaultMethodId : methods[0]?.id ?? "standard",
          methods: methods.length ? methods : [emptyMethod(0)],
        },
      };
    });
  }

  function submit() {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (response.ok) {
        setSettings(result);
        setMessage("تنظیمات ذخیره شد. برای مشاهده رنگ‌های جدید صفحه را رفرش کنید.");
      } else {
        setMessage(result.error ? "اطلاعات وارد شده معتبر نیست." : "ذخیره تنظیمات ناموفق بود.");
      }
    });
  }

  return (
    <div className="grid gap-5">
      <GlassPanel>
        <h2 className="mb-5 text-xl font-bold">اطلاعات عمومی سایت</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="field" value={settings.siteName ?? ""} onChange={(event) => updateGeneral("siteName", event.target.value)} placeholder="نام سایت" />
          <input className="field" value={settings.supportPhone ?? ""} onChange={(event) => updateGeneral("supportPhone", event.target.value)} placeholder="تلفن پشتیبانی" />
          <input className="field" value={settings.supportEmail ?? ""} onChange={(event) => updateGeneral("supportEmail", event.target.value)} placeholder="ایمیل پشتیبانی" />
          <input className="field" value={settings.seoTitle ?? ""} onChange={(event) => updateGeneral("seoTitle", event.target.value)} placeholder="عنوان SEO" />
          <textarea className="field min-h-24 py-3 md:col-span-2" value={settings.address ?? ""} onChange={(event) => updateGeneral("address", event.target.value)} placeholder="آدرس" />
          <textarea className="field min-h-24 py-3 md:col-span-2" value={settings.seoDescription ?? ""} onChange={(event) => updateGeneral("seoDescription", event.target.value)} placeholder="توضیحات SEO" />
        </div>
      </GlassPanel>

      <GlassPanel>
        <h2 className="mb-5 text-xl font-bold">رنگ دکمه‌ها و متن‌ها</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["primaryButtonColor", "رنگ دکمه اصلی"],
            ["primaryButtonTextColor", "رنگ متن دکمه اصلی"],
            ["buttonColor", "رنگ دکمه معمولی"],
            ["buttonTextColor", "رنگ متن دکمه معمولی"],
            ["headingTextColor", "رنگ تیترها"],
            ["bodyTextColor", "رنگ متن‌ها"],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-2 rounded-2xl border border-[#B8874B]/20 bg-white p-3 text-sm text-[#6F6256]">
              {label}
              <span className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.appearance[key as keyof SiteSettings["appearance"]]}
                  onChange={(event) => updateAppearance(key as keyof SiteSettings["appearance"], event.target.value)}
                  className="h-11 w-14 rounded-xl border border-[#B8874B]/25 bg-white p-1"
                />
                <input
                  className="field"
                  value={settings.appearance[key as keyof SiteSettings["appearance"]]}
                  onChange={(event) => updateAppearance(key as keyof SiteSettings["appearance"], event.target.value)}
                  dir="ltr"
                />
              </span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 rounded-2xl bg-[#FFF4DF] p-4">
          <button className="btn-primary btn" type="button">نمونه دکمه اصلی</button>
          <button className="btn" type="button">نمونه دکمه معمولی</button>
          <strong style={{ color: settings.appearance.headingTextColor }}>نمونه تیتر</strong>
          <span style={{ color: settings.appearance.bodyTextColor }}>نمونه متن سایت</span>
        </div>
      </GlassPanel>

      <GlassPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">روش‌های ارسال</h2>
          <button className="btn" type="button" onClick={addMethod}><Plus size={18} /> افزودن روش ارسال</button>
        </div>
        <div className="grid gap-4">
          {settings.shipping.methods.map((method, index) => (
            <div key={`${method.id}-${index}`} className="grid gap-3 rounded-3xl border border-[#B8874B]/20 bg-white p-4 lg:grid-cols-[1fr_1.2fr_150px_120px_44px]">
              <input className="field" value={method.id} onChange={(event) => updateMethod(index, { id: event.target.value })} placeholder="شناسه مثل standard" dir="ltr" />
              <input className="field" value={method.title} onChange={(event) => updateMethod(index, { title: event.target.value })} placeholder="عنوان روش ارسال" />
              <input className="field" type="number" min={0} value={method.price} onChange={(event) => updateMethod(index, { price: Number(event.target.value) })} placeholder="هزینه" />
              <label className="flex items-center justify-center gap-2 rounded-2xl border border-[#B8874B]/20 px-3">
                <input type="checkbox" checked={method.enabled} onChange={(event) => updateMethod(index, { enabled: event.target.checked })} />
                فعال
              </label>
              <button className="btn px-0" type="button" onClick={() => removeMethod(index)} aria-label="حذف روش ارسال"><Trash2 size={18} /></button>
              <input className="field lg:col-span-5" value={method.description ?? ""} onChange={(event) => updateMethod(index, { description: event.target.value })} placeholder="توضیح کوتاه" />
            </div>
          ))}
        </div>
        <label className="mt-4 grid gap-2 text-sm text-[#6F6256]">
          روش ارسال پیش‌فرض
          <select className="field" value={settings.shipping.defaultMethodId} onChange={(event) => setSettings((current) => ({ ...current, shipping: { ...current.shipping, defaultMethodId: event.target.value } }))}>
            {settings.shipping.methods.map((method) => <option key={method.id} value={method.id}>{method.title || method.id} - {formatPrice(method.price)}</option>)}
          </select>
        </label>
      </GlassPanel>

      <GlassPanel>
        <h2 className="mb-5 text-xl font-bold">تنظیم پرداخت پیش‌فرض</h2>
        <select className="field" value={settings.payment.defaultProvider} onChange={(event) => setSettings((current) => ({ ...current, payment: { defaultProvider: event.target.value } }))}>
          {paymentProviders.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
        </select>
      </GlassPanel>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary btn" type="button" onClick={submit} disabled={isPending}><Save size={18} /> {isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}</button>
        {message && <span className="rounded-2xl bg-[#FFF4DF] px-4 py-3 text-sm text-[#4A2F1B]">{message}</span>}
      </div>
    </div>
  );
}
