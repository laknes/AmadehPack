"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { defaultSiteSettings, type ShippingMethod } from "@/lib/site-settings-defaults";

type PaymentGateway = {
  provider: "MOCK" | "ZARINPAL" | "IDPAY" | "PAYIR" | "SEP" | "BEHPARDAKHT" | "SADAD";
  title: string;
  sandbox: boolean;
};

export default function CheckoutPage() {
  const { items, clear } = useCartStore();
  const [message, setMessage] = useState("");
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(defaultSiteSettings.shipping.methods.filter((method) => method.enabled));
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([{ provider: "MOCK", title: "پرداخت آزمایشی", sandbox: true }]);
  const [selectedShippingId, setSelectedShippingId] = useState(defaultSiteSettings.shipping.defaultMethodId);
  const [selectedProvider, setSelectedProvider] = useState<PaymentGateway["provider"]>("MOCK");
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedShipping = useMemo(() => shippingMethods.find((method) => method.id === selectedShippingId) ?? shippingMethods[0], [selectedShippingId, shippingMethods]);
  const shippingCost = selectedShipping?.price ?? 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      const [settingsResponse, gatewaysResponse] = await Promise.all([
        fetch("/api/site-settings"),
        fetch("/api/payment/gateways"),
      ]);
      const settings = settingsResponse.ok ? await settingsResponse.json() : null;
      const gateways = gatewaysResponse.ok ? await gatewaysResponse.json() : null;
      if (!mounted) return;

      const methods = ((settings?.shipping?.methods ?? []) as ShippingMethod[]).filter((method) => method.enabled);
      if (methods.length) {
        setShippingMethods(methods);
        setSelectedShippingId(settings?.shipping?.defaultMethodId ?? methods[0].id);
      }

      const activeGateways = ((gateways?.items ?? []) as PaymentGateway[]);
      if (activeGateways.length) {
        setPaymentGateways(activeGateways);
        const defaultProvider = settings?.payment?.defaultProvider as PaymentGateway["provider"] | undefined;
        setSelectedProvider(activeGateways.some((gateway) => gateway.provider === defaultProvider) ? defaultProvider! : activeGateways[0].provider);
      }
    }

    loadSettings().catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  async function submit(formData: FormData) {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price })),
        customer: {
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          city: formData.get("city"),
          addressLine: formData.get("addressLine"),
        },
        shippingMethodId: selectedShipping?.id ?? "standard",
        shippingCost,
        paymentProvider: selectedProvider,
        notes: formData.get("notes"),
      }),
    });
    const result = await response.json();
    if (response.ok) {
      clear();
      setMessage(`سفارش ثبت شد: ${result.orderNumber}`);
    } else {
      setMessage(result.error ?? "خطا در ثبت سفارش");
    }
  }

  return (
    <section className="container section grid gap-6 lg:grid-cols-[1fr_360px]">
      <form action={submit} className="glass grid gap-4 rounded-[28px] p-6">
        <h1 className="text-3xl font-black">تسویه حساب</h1>
        <input className="field" name="fullName" placeholder="نام و نام خانوادگی" required />
        <input className="field" name="phone" placeholder="شماره موبایل" required />
        <input className="field" name="city" placeholder="شهر" required />
        <textarea className="field min-h-28 py-3" name="addressLine" placeholder="آدرس کامل" required />
        <div className="grid gap-3">
          <h2 className="text-xl font-bold">روش ارسال</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {shippingMethods.map((method) => (
              <label key={method.id} className={`cursor-pointer rounded-3xl border p-4 transition ${selectedShippingId === method.id ? "border-[#FF8A1F] bg-[#FFF4DF]" : "border-[#B8874B]/20 bg-white"}`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-bold">
                    <input type="radio" name="shippingMethod" checked={selectedShippingId === method.id} onChange={() => setSelectedShippingId(method.id)} />
                    {method.title}
                  </span>
                  <span className="text-sm text-[#6F6256]">{formatPrice(method.price)}</span>
                </span>
                {method.description && <span className="mt-2 block text-sm leading-7 text-[#6F6256]">{method.description}</span>}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <h2 className="text-xl font-bold">روش پرداخت</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {paymentGateways.map((gateway) => (
              <label key={gateway.provider} className={`cursor-pointer rounded-3xl border p-4 transition ${selectedProvider === gateway.provider ? "border-[#FF8A1F] bg-[#FFF4DF]" : "border-[#B8874B]/20 bg-white"}`}>
                <span className="flex items-center gap-2 font-bold">
                  <input type="radio" name="paymentProvider" checked={selectedProvider === gateway.provider} onChange={() => setSelectedProvider(gateway.provider)} />
                  {gateway.title}
                </span>
                <span className="mt-2 block text-sm text-[#6F6256]">{gateway.sandbox ? "حالت تست" : "پرداخت واقعی"}</span>
              </label>
            ))}
          </div>
        </div>
        <textarea className="field min-h-24 py-3" name="notes" placeholder="توضیحات سفارش" />
        <button className="btn-primary btn" disabled={items.length === 0}>ثبت سفارش و پرداخت</button>
        {message && <p className="rounded-2xl bg-[#FFF4DF] p-4 text-[#4A2F1B]">{message}</p>}
      </form>
      <aside className="glass h-fit rounded-[28px] p-6">
        <h2 className="text-xl font-bold">فاکتور</h2>
        <div className="mt-5 grid gap-3 text-[#6F6256]">
          {items.map((item) => <div key={item.id} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></div>)}
        </div>
        <div className="mt-6 grid gap-2 border-t border-[#B8874B]/25 pt-4 text-sm text-[#6F6256]">
          <div className="flex justify-between gap-3"><span>جمع کالاها</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between gap-3"><span>ارسال</span><span>{formatPrice(shippingCost)}</span></div>
        </div>
        <div className="mt-4 text-lg font-bold">{formatPrice(total)}</div>
      </aside>
    </section>
  );
}

