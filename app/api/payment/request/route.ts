import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentRequestSchema } from "@/lib/validators";

const providerBaseUrls: Record<string, string> = {
  MOCK: "/api/payment/callback",
  ZARINPAL: "https://www.zarinpal.com/pg/StartPay",
  IDPAY: "https://idpay.ir/p/ws",
  PAYIR: "https://pay.ir/pg",
  SEP: "https://sep.shaparak.ir/payment.aspx",
  BEHPARDAKHT: "https://bpm.shaparak.ir/pgwchannel/startpay.mellat",
  SADAD: "https://sadad.shaparak.ir/Purchase",
};

export async function POST(request: Request) {
  const parsed = paymentRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, include: { payment: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const gateway = await prisma.paymentGateway.findUnique({ where: { provider: parsed.data.provider } });
  if (parsed.data.provider !== "MOCK" && !gateway?.active) return NextResponse.json({ error: "Payment gateway is not active" }, { status: 400 });

  const authority = `${parsed.data.provider}-${Date.now()}`;
  const callbackUrl = gateway?.callbackUrl ?? `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/payment/callback`;
  const payment = order.payment
    ? await prisma.payment.update({
        where: { orderId: order.id },
        data: { provider: parsed.data.provider.toLowerCase(), status: "MOCK_PENDING", authority, callbackUrl, rawResponse: { gateway: parsed.data.provider } },
      })
    : await prisma.payment.create({
        data: { orderId: order.id, amount: order.total, provider: parsed.data.provider.toLowerCase(), status: "MOCK_PENDING", authority, callbackUrl, rawResponse: { gateway: parsed.data.provider } },
      });

  const redirectUrl =
    parsed.data.provider === "MOCK"
      ? `${callbackUrl}?Authority=${authority}&Status=OK&paymentId=${payment.id}`
      : `${providerBaseUrls[parsed.data.provider]}?authority=${authority}`;

  return NextResponse.json({ authority, paymentId: payment.id, redirectUrl, provider: parsed.data.provider });
}
