import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function UsersAdminPage() {
  return (
    <AdminShell title="مدیریت کاربران">
      <AdminCrudResource
        title="کاربر"
        endpoint="/api/admin/users"
        createEnabled={false}
        editEnabled={false}
        deleteEnabled={false}
        columns={[
          { key: "name", label: "نام" },
          { key: "email", label: "ایمیل" },
          { key: "phone", label: "موبایل" },
          { key: "roles", label: "نقش‌ها" },
          { key: "orders", label: "سفارش‌ها" },
        ]}
      />
    </AdminShell>
  );
}

