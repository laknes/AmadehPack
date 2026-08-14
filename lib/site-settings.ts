import { prisma } from "@/lib/prisma";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings-defaults";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function mergeSiteSettings(value: unknown): SiteSettings {
  if (!isRecord(value)) return defaultSiteSettings;
  const appearance = isRecord(value.appearance) ? value.appearance : {};
  const shipping = isRecord(value.shipping) ? value.shipping : {};
  const payment = isRecord(value.payment) ? value.payment : {};
  const methods = Array.isArray(shipping.methods)
    ? shipping.methods.map((method, index) => {
        const record = isRecord(method) ? method : {};
        return {
          id: asString(record.id, `method-${index + 1}`),
          title: asString(record.title, `روش ارسال ${index + 1}`),
          description: typeof record.description === "string" ? record.description : "",
          price: asNumber(record.price, 0),
          enabled: typeof record.enabled === "boolean" ? record.enabled : true,
        };
      })
    : defaultSiteSettings.shipping.methods;

  const siteName = asString(value.siteName, defaultSiteSettings.siteName ?? "کرافت پک");
  const seoTitle = asString(value.seoTitle, defaultSiteSettings.seoTitle ?? "کرافت پک | فروشگاه بسته‌بندی غذا");
  const primaryButtonColor = asString(appearance.primaryButtonColor, defaultSiteSettings.appearance.primaryButtonColor);

  return {
    ...defaultSiteSettings,
    ...value,
    siteName: siteName === "آماده‌پک" ? "کرافت پک" : siteName,
    seoTitle: seoTitle === "آماده‌پک | فروشگاه بسته‌بندی غذا" ? "کرافت پک | فروشگاه بسته‌بندی غذا" : seoTitle,
    appearance: {
      ...defaultSiteSettings.appearance,
      ...appearance,
      primaryButtonColor: primaryButtonColor === "#ff8a1f" ? "#8b5a2b" : primaryButtonColor,
    },
    shipping: {
      defaultMethodId: asString(shipping.defaultMethodId, defaultSiteSettings.shipping.defaultMethodId),
      methods: methods.length ? methods : defaultSiteSettings.shipping.methods,
    },
    payment: {
      defaultProvider: asString(payment.defaultProvider, defaultSiteSettings.payment.defaultProvider),
    },
  };
}

export async function getSiteSettings() {
  if (!process.env.DATABASE_URL) return defaultSiteSettings;

  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "site" } });
    return mergeSiteSettings(setting?.value);
  } catch {
    return defaultSiteSettings;
  }
}
