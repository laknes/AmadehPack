import { AdminShell } from "@/components/admin-shell";
import { AdminSiteSettingsForm } from "@/components/admin-site-settings-form";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SettingsAdminPage() {
  const settings = await getSiteSettings();
  return <AdminShell title="تنظیمات سایت"><AdminSiteSettingsForm initialSettings={settings} /></AdminShell>;
}

