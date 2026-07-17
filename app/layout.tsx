import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "@fontsource-variable/vazirmatn";
import "@fontsource/lalezar/400.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: {
    default: "آماده‌پک | فروشگاه ظروف و بسته‌بندی لوکس",
    template: "%s | آماده‌پک",
  },
  description: "فروشگاه حرفه‌ای ظروف کاغذی، کرافت، درب و بسته‌بندی غذای آماده با تجربه سه‌بعدی و پنل مدیریتی.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "آماده‌پک",
    description: "ظروف و بسته‌بندی غذای آماده با کیفیت حرفه‌ای.",
    type: "website",
    locale: "fa_IR",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const themeStyle = {
    "--primary-button-color": settings.appearance.primaryButtonColor,
    "--primary-button-text-color": settings.appearance.primaryButtonTextColor,
    "--button-color": settings.appearance.buttonColor,
    "--button-text-color": settings.appearance.buttonTextColor,
    "--heading-text-color": settings.appearance.headingTextColor,
    "--body-text-color": settings.appearance.bodyTextColor,
  } as CSSProperties;

  return (
    <html lang="fa" dir="rtl">
      <body style={themeStyle}>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}

