import { AdminShell } from "@/components/admin-shell";
import { AdminEnamadForm } from "@/components/admin-enamad-form";

export default function EnamadAdminPage() {
  return (
    <AdminShell title="تنظیمات اینماد">
      <AdminEnamadForm />
    </AdminShell>
  );
}

