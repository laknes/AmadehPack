import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function ProductsAdminPage() {
  return (
    <AdminShell title="مدیریت محصولات">
      <AdminCrudResource
        title="محصول"
        endpoint="/api/admin/products"
        fields={[
          { name: "name", label: "نام", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "sku", label: "SKU", required: true },
          { name: "description", label: "توضیحات", type: "textarea", required: true },
          { name: "categoryId", label: "شناسه دسته‌بندی", required: true },
          { name: "brandId", label: "شناسه برند", nullable: true },
          { name: "price", label: "قیمت", type: "number", nullable: true },
          { name: "isFeatured", label: "ویژه", type: "checkbox" },
          { name: "isActive", label: "فعال", type: "checkbox" },
        ]}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "نام" },
          { key: "sku", label: "SKU" },
          { key: "category.name", label: "دسته" },
          { key: "price", label: "قیمت" },
          { key: "isActive", label: "وضعیت" },
        ]}
      />
    </AdminShell>
  );
}

