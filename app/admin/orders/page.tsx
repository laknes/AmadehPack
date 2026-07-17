import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function OrdersAdminPage() {
  return (
    <AdminShell title="مدیریت سفارش‌ها">
      <AdminCrudResource
        title="سفارش"
        endpoint="/api/admin/orders"
        itemPath="/api/admin/orders/:id/status"
        createEnabled={false}
        deleteEnabled={false}
        fields={[
          { name: "status", label: "وضعیت", type: "select", required: true, options: ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"].map((value) => ({ label: value, value })) },
        ]}
        columns={[
          { key: "orderNumber", label: "شماره سفارش" },
          { key: "status", label: "وضعیت" },
          { key: "total", label: "مبلغ" },
          { key: "shipping.fullName", label: "مشتری" },
          { key: "payment.provider", label: "پرداخت" },
        ]}
      />
    </AdminShell>
  );
}

