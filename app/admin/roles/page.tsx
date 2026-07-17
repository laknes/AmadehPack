import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function RolesAdminPage() {
  return (
    <AdminShell title="مدیریت نقش‌ها">
      <AdminCrudResource
        title="نقش"
        endpoint="/api/admin/roles"
        fields={[
          { name: "name", label: "نام نقش", required: true },
          { name: "description", label: "توضیح", nullable: true },
        ]}
        columns={[
          { key: "name", label: "نام" },
          { key: "description", label: "توضیح" },
          { key: "users", label: "تعداد کاربران" },
        ]}
      />
    </AdminShell>
  );
}

