import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { orderNumber } from "@/lib/utils";
import { orderSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const settings = await getSiteSettings();
  const selectedShipping = settings.shipping.methods.find((method) => method.id === parsed.data.shippingMethodId && method.enabled);
  if (!selectedShipping) return NextResponse.json({ error: "Shipping method is not available" }, { status: 400 });
  const provider = parsed.data.paymentProvider;
  if (provider !== "MOCK") {
    const gateway = await prisma.paymentGateway.findUnique({ where: { provider } }).catch(() => null);
    if (!gateway?.active) return NextResponse.json({ error: "Payment gateway is not active" }, { status: 400 });
  }
  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + selectedShipping.price;
  const paidWithMock = provider === "MOCK";
  const notes = [
    parsed.data.notes,
    `روش ارسال: ${selectedShipping.title}`,
    `هزینه ارسال: ${selectedShipping.price}`,
    `روش پرداخت: ${provider}`,
  ].filter(Boolean).join("\n");
  const order = await prisma.order.create({
    data: {
      orderNumber: orderNumber(),
      total,
      status: paidWithMock ? "PAID" : "PENDING",
      notes,
      items: { create: parsed.data.items.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price })) },
      shipping: { create: parsed.data.customer },
      payment: { create: { provider: provider.toLowerCase(), status: paidWithMock ? "PAID" : "MOCK_PENDING", amount: total, transactionId: paidWithMock ? `MOCK-${Date.now()}` : null } },
    },
  });
  return NextResponse.json({ id: order.id, orderNumber: order.orderNumber });
}

export async function GET() {
  const orders = await prisma.order.findMany({ include: { items: true, payment: true, shipping: true }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ items: orders });
}
