import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function verify(url: URL) {
  const authority = url.searchParams.get("Authority") ?? url.searchParams.get("authority");
  const status = url.searchParams.get("Status") ?? url.searchParams.get("status");
  if (!authority) return NextResponse.json({ error: "Authority is required" }, { status: 400 });

  const payment = await prisma.payment.findFirst({ where: { authority }, include: { order: true } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const paid = status?.toLowerCase() === "ok" || status?.toLowerCase() === "success";
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: paid ? "PAID" : "FAILED",
      transactionId: paid ? `TRX-${Date.now()}` : null,
      rawResponse: { status, authority, verifiedAt: new Date().toISOString() },
      order: { update: { status: paid ? "PAID" : "PENDING" } },
    },
  });

  return NextResponse.json({ ok: paid, paymentId: updated.id, orderId: payment.orderId, orderNumber: payment.order.orderNumber });
}

export async function GET(request: Request) {
  return verify(new URL(request.url));
}

export async function POST(request: Request) {
  const body = await request.json();
  const url = new URL("http://local");
  for (const [key, value] of Object.entries(body)) url.searchParams.set(key, String(value));
  return verify(url);
}
