import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { paymentGatewaySchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  const parsed = paymentGatewaySchema.partial().safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = { ...parsed.data, settings: parsed.data.settings as Prisma.InputJsonValue | undefined };
  const item = await prisma.paymentGateway.update({ where: { id }, data });
  await logActivity("payment_gateway.update", "PaymentGateway", id);
  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  await prisma.paymentGateway.delete({ where: { id } });
  await logActivity("payment_gateway.delete", "PaymentGateway", id);
  return NextResponse.json({ ok: true });
}
