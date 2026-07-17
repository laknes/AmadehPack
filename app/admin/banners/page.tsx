import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function BannersAdminPage() {
  return (
    <AdminShell title="مدیریت بنرها و اسلایدر">
      <AdminCrudResource
        title="بنر"
        endpoint="/api/admin/banners"
        fields={[
          { name: "title", label: "عنوان", required: true },
          { name: "subtitle", label: "زیرعنوان", nullable: true },
          { name: "imageUrl", label: "تصویر", nullable: true, imageHint: "Hero: ۱۶۰۰×۹۰۰ | بنر عریض: ۱۴۴۰×۴۲۰ پیکسل" },
          { name: "ctaLabel", label: "متن CTA", nullable: true },
          { name: "ctaHref", label: "لینک CTA", nullable: true },
          { name: "placement", label: "جایگاه", type: "select", required: true, options: ["HOME_HERO", "HOME_FEATURED", "SHOP_TOP", "ADMIN_NOTICE"].map((value) => ({ label: value, value })) },
          { name: "sortOrder", label: "ترتیب", type: "number" },
          { name: "active", label: "فعال", type: "checkbox" },
        ]}
        columns={[
          { key: "title", label: "عنوان" },
          { key: "placement", label: "جایگاه" },
          { key: "sortOrder", label: "ترتیب" },
          { key: "active", label: "وضعیت" },
        ]}
      />
    </AdminShell>
  );
}

