import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const imageSchema = z.object({
  url: z.string().min(1).optional(),
  alt: z.string().min(1).optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  const parsed = imageSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.productImage.update({ where: { id }, data: parsed.data });
  await logActivity("product_image.update", "ProductImage", id);
  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  await prisma.productImage.delete({ where: { id } });
  await logActivity("product_image.delete", "ProductImage", id);
  return NextResponse.json({ ok: true });
}
