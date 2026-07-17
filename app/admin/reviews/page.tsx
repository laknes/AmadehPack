import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function ReviewsAdminPage() {
  return (
    <AdminShell title="مدیریت نظرات">
      <AdminCrudResource
        title="نظر"
        endpoint="/api/admin/reviews"
        createEnabled={false}
        fields={[{ name: "approved", label: "تایید شده", type: "checkbox" }]}
        columns={[
          { key: "product.name", label: "محصول" },
          { key: "user.name", label: "کاربر" },
          { key: "rating", label: "امتیاز" },
          { key: "body", label: "متن" },
          { key: "approved", label: "وضعیت" },
        ]}
      />
    </AdminShell>
  );
}

