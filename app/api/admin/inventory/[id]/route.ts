import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { inventorySchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  const parsed = inventorySchema.partial().safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.inventory.update({ where: { id }, data: parsed.data });
  await logActivity("inventory.update", "Inventory", id);
  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  await prisma.inventory.delete({ where: { id } });
  await logActivity("inventory.delete", "Inventory", id);
  return NextResponse.json({ ok: true });
}
