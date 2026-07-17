import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { inventorySchema } from "@/lib/validators";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const items = await prisma.inventory.findMany({ include: { product: true, variant: true }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = inventorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.inventory.create({ data: parsed.data });
  await logActivity("inventory.create", "Inventory", item.id);
  return NextResponse.json(item, { status: 201 });
}
