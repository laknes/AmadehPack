export type ShippingMethod = {
  id: string;
  title: string;
  description?: string;
  price: number;
  enabled: boolean;
};

export type SiteSettings = {
  siteName?: string;
  supportPhone?: string;
  supportEmail?: string;
  address?: string;
  seoTitle?: string;
  seoDescription?: string;
  appearance: {
    primaryButtonColor: string;
    primaryButtonTextColor: string;
    buttonColor: string;
    buttonTextColor: string;
    headingTextColor: string;
    bodyTextColor: string;
  };
  shipping: {
    defaultMethodId: string;
    methods: ShippingMethod[];
  };
  payment: {
    defaultProvider: string;
  };
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "آماده‌پک",
  supportPhone: "021-00000000",
  supportEmail: "sales@amadehpack.local",
  address: "",
  seoTitle: "آماده‌پک | فروشگاه بسته‌بندی غذا",
  seoDescription: "فروشگاه حرفه‌ای ظروف کاغذی، کرافت، درب و بسته‌بندی غذای آماده.",
  appearance: {
    primaryButtonColor: "#ff8a1f",
    primaryButtonTextColor: "#1c1108",
    buttonColor: "#ffffff",
    buttonTextColor: "#1c1108",
    headingTextColor: "#1c1108",
    bodyTextColor: "#1c1108",
  },
  shipping: {
    defaultMethodId: "standard",
    methods: [
      { id: "standard", title: "ارسال معمولی", description: "ارسال اقتصادی برای سفارش‌های عادی", price: 0, enabled: true },
      { id: "express", title: "ارسال فوری", description: "اولویت پردازش و تحویل سریع‌تر", price: 250000, enabled: true },
      { id: "pickup", title: "تحویل حضوری", description: "هماهنگی با واحد فروش برای دریافت حضوری", price: 0, enabled: false },
    ],
  },
  payment: {
    defaultProvider: "MOCK",
  },
};
