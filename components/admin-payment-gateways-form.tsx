"use client";

import { useEffect, useState, useTransition } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { GlassPanel } from "@/components/glass-panel";

type Gateway = {
  id?: string;
  provider: "MOCK" | "ZARINPAL" | "IDPAY" | "PAYIR" | "SEP" | "BEHPARDAKHT" | "SADAD";
  title: string;
  merchantId?: string | null;
  terminalId?: string | null;
  apiKey?: string | null;
  callbackUrl?: string | null;
  sandbox: boolean;
  active: boolean;
};

const providers: Gateway["provider"][] = ["MOCK", "ZARINPAL", "IDPAY", "PAYIR", "SEP", "BEHPARDAKHT", "SADAD"];

const providerTitles: Record<Gateway["provider"], string> = {
  MOCK: "پرداخت آزمایشی",
  ZARINPAL: "زرین‌پال",
  IDPAY: "آیدی‌پی",
  PAYIR: "Pay.ir",
  SEP: "سامان",
  BEHPARDAKHT: "به‌پرداخت ملت",
  SADAD: "سداد",
};

function emptyGateway(provider: Gateway["provider"] = "MOCK"): Gateway {
  return {
    provider,
    title: providerTitles[provider],
    merchantId: "",
    terminalId: "",
    apiKey: "",
    callbackUrl: "",
    sandbox: provider === "MOCK",
    active: provider === "MOCK",
  };
}

export function AdminPaymentGatewaysForm() {
  const [items, setItems] = useState<Gateway[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Gateway["provider"]>("MOCK");
  const [form, setForm] = useState<Gateway>(emptyGateway());
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch("/api/admin/payment-gateways");
      if (!response.ok) return;
      const result = await response.json();
      const gateways = (result.items ?? []) as Gateway[];
      setItems(gateways);
      const first = gateways[0] ?? emptyGateway();
      setSelectedProvider(first.provider);
      setForm({ ...emptyGateway(first.provider), ...first });
    });
  }, []);

  function selectProvider(provider: Gateway["provider"]) {
    setSelectedProvider(provider);
    const gateway = items.find((item) => item.provider === provider);
    setForm({ ...emptyGateway(provider), ...gateway, provider });
  }

  function update<K extends keyof Gateway>(key: K, value: Gateway[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setMessage("");
    startTransition(async () => {
      const payload = {
        provider: form.provider,
        title: form.title,
        merchantId: form.merchantId || null,
        terminalId: form.terminalId || null,
        apiKey: form.apiKey || null,
        callbackUrl: form.callbackUrl || null,
        sandbox: form.sandbox,
        active: form.active,
        settings: {},
      };
      const response = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        setItems((current) => [result, ...current.filter((item) => item.provider !== result.provider)]);
        setForm({ ...emptyGateway(result.provider), ...result });
        setMessage("تنظیمات درگاه ذخیره شد.");
      } else {
        setMessage(result.error ? "اطلاعات درگاه معتبر نیست." : "ذخیره درگاه ناموفق بود.");
      }
    });
  }

  return (
    <div className="grid gap-5">
      <GlassPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">تنظیمات درگاه پرداخت</h2>
            <p className="mt-2 text-sm leading-7 text-[#6F6256]">اطلاعات اتصال هر درگاه را وارد کنید و درگاه‌های قابل نمایش در تسویه حساب را فعال کنید.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF4DF] px-4 py-3 text-sm text-[#4A2F1B]"><ShieldCheck size={18} /> اطلاعات API Key فقط در پنل ادمین نمایش داده می‌شود</span>
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {providers.map((provider) => (
            <button
              key={provider}
              className={selectedProvider === provider ? "btn-primary btn" : "btn"}
              type="button"
              onClick={() => selectProvider(provider)}
            >
              {providerTitles[provider]}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="field" value={form.provider} readOnly dir="ltr" />
          <input className="field" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="عنوان نمایشی" />
          <input className="field" value={form.merchantId ?? ""} onChange={(event) => update("merchantId", event.target.value)} placeholder="Merchant ID" dir="ltr" />
          <input className="field" value={form.terminalId ?? ""} onChange={(event) => update("terminalId", event.target.value)} placeholder="Terminal ID" dir="ltr" />
          <input className="field" value={form.apiKey ?? ""} onChange={(event) => update("apiKey", event.target.value)} placeholder="API Key / Secret" dir="ltr" />
          <input className="field" value={form.callbackUrl ?? ""} onChange={(event) => update("callbackUrl", event.target.value)} placeholder="Callback URL" dir="ltr" />
          <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#B8874B]/20 bg-white px-4">
            <input type="checkbox" checked={form.sandbox} onChange={(event) => update("sandbox", event.target.checked)} />
            حالت تست Sandbox
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#B8874B]/20 bg-white px-4">
            <input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} />
            فعال در صفحه پرداخت
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button className="btn-primary btn" type="button" onClick={save} disabled={isPending}><Save size={18} /> {isPending ? "در حال ذخیره..." : "ذخیره درگاه"}</button>
          {message && <span className="rounded-2xl bg-[#FFF4DF] px-4 py-3 text-sm text-[#4A2F1B]">{message}</span>}
        </div>
      </GlassPanel>

      <GlassPanel>
        <h2 className="mb-5 text-xl font-bold">وضعیت درگاه‌ها</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-separate border-spacing-y-2 text-sm">
            <tbody>
              {providers.map((provider) => {
                const gateway = items.find((item) => item.provider === provider);
                return (
                  <tr key={provider} className="bg-[#FFF4DF]">
                    <td className="p-4 first:rounded-r-2xl">{providerTitles[provider]}</td>
                    <td className="p-4" dir="ltr">{provider}</td>
                    <td className="p-4">{gateway?.active ? "فعال" : "غیرفعال"}</td>
                    <td className="p-4">{gateway?.sandbox ? "Sandbox" : "Production"}</td>
                    <td className="p-4 last:rounded-l-2xl"><button className="btn" type="button" onClick={() => selectProvider(provider)}>ویرایش</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
