import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function BlogAdminPage() {
  return (
    <AdminShell title="مدیریت بلاگ">
      <AdminCrudResource
        title="مقاله"
        endpoint="/api/admin/blog"
        fields={[
          { name: "title", label: "عنوان", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "excerpt", label: "خلاصه", type: "textarea", required: true },
          { name: "coverUrl", label: "تصویر کاور", nullable: true, imageHint: "ابعاد کاور: ۱۲۰۰×۶۳۰ پیکسل" },
          { name: "content", label: "محتوا", type: "textarea", required: true },
          { name: "published", label: "منتشر شده", type: "checkbox" },
        ]}
        columns={[
          { key: "title", label: "عنوان" },
          { key: "slug", label: "Slug" },
          { key: "author.name", label: "نویسنده" },
          { key: "published", label: "وضعیت" },
        ]}
      />
    </AdminShell>
  );
}

