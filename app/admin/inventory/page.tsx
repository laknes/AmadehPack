import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function InventoryAdminPage() {
  return (
    <AdminShell title="مدیریت موجودی">
      <AdminCrudResource
        title="موجودی"
        endpoint="/api/admin/inventory"
        fields={[
          { name: "productId", label: "شناسه محصول", nullable: true },
          { name: "variantId", label: "شناسه تنوع", nullable: true },
          { name: "quantity", label: "موجودی", type: "number" },
          { name: "reserved", label: "رزرو", type: "number" },
          { name: "lowStock", label: "حد هشدار", type: "number" },
        ]}
        columns={[
          { key: "product.name", label: "محصول" },
          { key: "variant.name", label: "تنوع" },
          { key: "quantity", label: "موجودی" },
          { key: "reserved", label: "رزرو" },
          { key: "lowStock", label: "حد هشدار" },
        ]}
      />
    </AdminShell>
  );
}

