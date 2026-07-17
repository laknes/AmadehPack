import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function ActivityAdminPage() {
  return (
    <AdminShell title="لاگ فعالیت مدیران">
      <AdminCrudResource
        title="لاگ فعالیت"
        endpoint="/api/admin/activity"
        createEnabled={false}
        editEnabled={false}
        deleteEnabled={false}
        columns={[
          { key: "action", label: "عملیات" },
          { key: "entity", label: "موجودیت" },
          { key: "entityId", label: "شناسه" },
          { key: "user.email", label: "کاربر" },
          { key: "createdAt", label: "زمان" },
        ]}
      />
    </AdminShell>
  );
}

