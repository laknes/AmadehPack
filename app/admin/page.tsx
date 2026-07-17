import { AdminShell } from "@/components/admin-shell";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata = { title: "داشبورد مدیریت" };

export default function AdminPage() {
  return (
    <AdminShell title="داشبورد آماری">
      <AdminDashboard />
    </AdminShell>
  );
}

