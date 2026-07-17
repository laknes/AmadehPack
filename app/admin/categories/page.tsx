import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function CategoriesAdminPage() {
  return (
    <AdminShell title="مدیریت دسته‌بندی‌ها">
      <AdminCrudResource
        title="دسته‌بندی"
        endpoint="/api/admin/categories"
        fields={[
          { name: "name", label: "نام", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "description", label: "توضیحات", nullable: true },
          { name: "imageUrl", label: "تصویر", nullable: true, imageHint: "ابعاد پیشنهادی: ۸۰۰×۶۰۰ پیکسل" },
          { name: "parentId", label: "شناسه والد", nullable: true },
        ]}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "نام" },
          { key: "slug", label: "Slug" },
          { key: "parent.name", label: "والد" },
          { key: "imageUrl", label: "تصویر" },
        ]}
      />
    </AdminShell>
  );
}

