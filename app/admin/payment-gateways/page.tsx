import { AdminShell } from "@/components/admin-shell";
import { AdminPaymentGatewaysForm } from "@/components/admin-payment-gateways-form";

export default function PaymentGatewaysAdminPage() {
  return (
    <AdminShell title="مدیریت درگاه‌های پرداخت">
      <AdminPaymentGatewaysForm />
    </AdminShell>
  );
}

