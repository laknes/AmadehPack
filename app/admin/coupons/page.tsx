import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function CouponsAdminPage() {
  return (
    <AdminShell title="مدیریت تخفیف‌ها">
      <AdminCrudResource
        title="کوپن"
        endpoint="/api/admin/coupons"
        fields={[
          { name: "code", label: "کد", required: true },
          { name: "description", label: "توضیح", nullable: true },
          { name: "percentOff", label: "درصد تخفیف", type: "number", nullable: true },
          { name: "amountOff", label: "مبلغ تخفیف", type: "number", nullable: true },
          { name: "usageLimit", label: "سقف استفاده", type: "number", nullable: true },
          { name: "active", label: "فعال", type: "checkbox" },
        ]}
        columns={[
          { key: "code", label: "کد" },
          { key: "percentOff", label: "درصد" },
          { key: "amountOff", label: "مبلغ" },
          { key: "usedCount", label: "استفاده شده" },
          { key: "active", label: "وضعیت" },
        ]}
      />
    </AdminShell>
  );
}

