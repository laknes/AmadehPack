import { AdminShell } from "@/components/admin-shell";
import { AdminCrudResource } from "@/components/admin-crud-resource";

export default function ContactTicketsAdminPage() {
  return (
    <AdminShell title="مدیریت تیکت‌های تماس">
      <AdminCrudResource
        title="تیکت تماس"
        endpoint="/api/admin/contact-tickets"
        fields={[{
          name: "status",
          label: "وضعیت",
          type: "select",
          required: true,
          options: [
            { label: "جدید", value: "NEW" },
            { label: "در حال بررسی", value: "IN_PROGRESS" },
            { label: "پاسخ داده شد", value: "ANSWERED" },
            { label: "بسته شد", value: "CLOSED" },
          ],
        }]}
        columns={[
          { key: "fullName", label: "نام" },
          { key: "phone", label: "تماس" },
          { key: "requestType", label: "نوع درخواست" },
          { key: "product", label: "محصول" },
          { key: "message", label: "پیام" },
          { key: "status", label: "وضعیت" },
          { key: "createdAt", label: "تاریخ" },
        ]}
        createEnabled={false}
        deleteEnabled
      />
    </AdminShell>
  );
}