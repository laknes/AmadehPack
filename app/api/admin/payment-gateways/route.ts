import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { paymentGatewaySchema } from "@/lib/validators";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const items = await prisma.paymentGateway.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = paymentGatewaySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = { ...parsed.data, settings: parsed.data.settings as Prisma.InputJsonValue | undefined };
  const item = await prisma.paymentGateway.upsert({
    where: { provider: data.provider },
    update: data,
    create: data,
  });
  await logActivity("payment_gateway.upsert", "PaymentGateway", item.id, { provider: item.provider });
  return NextResponse.json(item, { status: 201 });
}
